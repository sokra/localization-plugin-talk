const { RawSource } = require("webpack-sources");
const { Generator, RuntimeModule, RuntimeGlobals } = require("webpack");
const { compareModulesByIdentifier } = require("webpack").util.comparators;

/** @typedef {import("webpack/lib/Compiler")} Compiler */

class LocalizationPlugin {
	constructor({ languages = ["en", "de"], defaultLanguage = "en" } = {}) {
		this.languages = languages;
		this.defaultLanguage = defaultLanguage;
	}

	/**
	 * @param {Compiler} compiler
	 */
	apply(compiler) {
		const { defaultLanguage, languages } = this;

		class LocalizationParser {
			parse(source, { module }) {
				module.buildMeta.exportsType = "default";
				module.buildMeta.defaultObject = "redirect-warn";
				module.buildInfo.content = JSON.parse(source);
				module.buildInfo.contentSize = JSON.stringify(
					module.buildInfo.content[defaultLanguage]
				).length;
				return true;
			}
		}

		const TYPES = new Set(["localization"]);

		class LocalizationGenerator extends Generator {
			getTypes() {
				return TYPES;
			}

			getSize(module) {
				return module.buildInfo.contentSize;
			}

			generate() {
				return null;
			}
		}

		class LocalizationLoadingRuntimeModule extends RuntimeModule {
			constructor(runtimeRequirements) {
				super("localization chunk loading", 10);
				this.runtimeRequirements = runtimeRequirements;
			}

			/**
			 * @returns {string} runtime code
			 */
			generate() {
				let result = `
const LANGUAGES = new Set(${JSON.stringify(languages)});
const data = JSON.parse(document.querySelector("script[type=localization]").textContent);
for(const moduleId of Object.keys(data)) {
	${RuntimeGlobals.moduleCache}[moduleId] = {
		exports: data[moduleId]
	};
}
`;

				if (this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {
					result += `${
						RuntimeGlobals.ensureChunkHandlers
					}.localization = (chunkId, promises) => {
	promises.push((async () => {
		let lang = navigator.language;
		while(lang && !LANGUAGES.has(lang)) lang = lang.slice(0, -1);
		const res = await fetch(\`localization-\${chunkId}.\${lang || ${JSON.stringify(
			defaultLanguage
		)}}.json\`);
		const data = await res.json();
		for(const moduleId of Object.keys(data)) {
			${RuntimeGlobals.moduleCache}[moduleId] = {
				exports: data[moduleId]
			};
		}
	})());
}`;
				}
				return result;
			}
		}

		compiler.hooks.compilation.tap(
			"LocalizationPlugin",
			(compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.afterResolve.tap(
					"LocalizationPlugin",
					resolveData => {
						if (resolveData.createData.type === "localization") {
							resolveData.createData.loaders.unshift({
								loader: require.resolve("./localization-loader.js"),
								options: {
									languages,
									defaultLanguage
								}
							});
						}
					}
				);

				normalModuleFactory.hooks.createParser
					.for("localization")
					.tap("LocalizationPlugin", () => {
						return new LocalizationParser();
					});

				normalModuleFactory.hooks.createGenerator
					.for("localization")
					.tap("LocalizationPlugin", () => {
						return new LocalizationGenerator();
					});

				compilation.hooks.renderManifest.tap(
					"LocalizationPlugin",
					(manifest, { chunk, chunkGraph, moduleGraph }) => {
						const localizationModules = chunkGraph.getOrderedChunkModulesIterableBySourceType(
							chunk,
							"localization",
							compareModulesByIdentifier
						);

						for (const lang of languages) {
							manifest.push({
								render: () => {
									const data = {};
									if (localizationModules) {
										for (const module of localizationModules) {
											if (!module.buildInfo.content) continue;
											const moduleData = {};
											const content = module.buildInfo.content[lang];
											const exportsInfo = moduleGraph.getExportInfo(
												module,
												"default"
											).exportsInfo;
											for (const key of Object.keys(content)) {
												const mangledKey = exportsInfo.getUsedName(key);
												if (mangledKey) moduleData[mangledKey] = content[key];
											}
											data[chunkGraph.getModuleId(module)] = moduleData;
										}
									}
									return new RawSource(JSON.stringify(data));
								},
								filenameTemplate: `localization-[id].${lang}.json`,
								pathOptions: {
									chunk
								},
								identifier: `localization-chunk-${chunk.id}-${lang}`,
								hash: chunk.hash
							});
						}
						return manifest;
					}
				);

				compilation.hooks.additionalTreeRuntimeRequirements.tap(
					"LocalizationPlugin",
					(chunk, set) => {
						set.add(RuntimeGlobals.moduleCache);
						compilation.addRuntimeModule(
							chunk,
							new LocalizationLoadingRuntimeModule(set)
						);
					}
				);
			}
		);
	}
}

module.exports = LocalizationPlugin;

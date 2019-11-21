const { RawSource } = require("webpack-sources");
const { Generator } = require("webpack");
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
				module.buildInfo.content = JSON.parse(source);
				module.buildInfo.contentSize = JSON.stringify(
					module.buildInfo.content
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

		compiler.hooks.compilation.tap(
			"LocalizationPlugin",
			(compilation, { normalModuleFactory }) => {
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

						const lang = defaultLanguage;
						manifest.push({
							render: () => {
								const data = {};
								if (localizationModules) {
									for (const module of localizationModules) {
										if (!module.buildInfo.content) continue;
										const content = module.buildInfo.content;
										data[chunkGraph.getModuleId(module)] = content;
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
						return manifest;
					}
				);
			}
		);
	}
}

module.exports = LocalizationPlugin;

const { Generator } = require("webpack");

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
			}
		);
	}
}

module.exports = LocalizationPlugin;

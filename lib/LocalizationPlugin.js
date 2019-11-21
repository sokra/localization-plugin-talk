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

		// TODO: class LocalizationParser { parse(source, { module }) { } }

		// TODO: class LocalizationGenerator extends Generator { getTypes() {} getSize(module) {} generate() {} }

		compiler.hooks.compilation.tap(
			"LocalizationPlugin",
			(compilation, { normalModuleFactory }) => {
				// TODO
			}
		);
	}
}

module.exports = LocalizationPlugin;

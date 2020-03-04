const path = require("path");
const HtmlPlugin = require("./lib/HtmlPlugin");
const LocalizationPlugin = require("./lib/LocalizationPlugin");

module.exports = {
	module: {
		rules: [
			{
				test: /loc\.json$/,
				type: "localization"
			}
		]
	},
	plugins: [new HtmlPlugin(), new LocalizationPlugin()],
	experiments: {
		topLevelAwait: true
	}
};

const path = require("path");
const HtmlPlugin = require("./lib/HtmlPlugin");
const LocalizationPlugin = require("./lib/LocalizationPlugin");

module.exports = {
	plugins: [new HtmlPlugin()],
	experiments: {
		topLevelAwait: true
	}
};

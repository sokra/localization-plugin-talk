const path = require("path");
const HtmlPlugin = require("./lib/HtmlPlugin");

module.exports = {
	plugins: [new HtmlPlugin()],
	experiments: {
		topLevelAwait: true
	}
};

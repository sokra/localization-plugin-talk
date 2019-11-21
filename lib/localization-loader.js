module.exports = async function(source) {
	const { defaultLanguage } = this.query;
	const data = {};
	data[defaultLanguage] = JSON.parse(source);
	return JSON.stringify(data);
};

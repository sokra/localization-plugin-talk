module.exports = async function(source) {
	const readJsonAsync = path =>
		new Promise((resolve, reject) =>
			this.fs.readJson(path, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			})
		);
	const { defaultLanguage, languages } = this.query;
	const data = {};
	data[defaultLanguage] = JSON.parse(source);
	await Promise.all(
		languages
			.filter(l => l !== defaultLanguage)
			.map(async lang => {
				const file = this.resourcePath.replace(/\.json$/, `.${lang}.json`);
				this.addDependency(file);
				try {
					data[lang] = await readJsonAsync(file);
				} catch (err) {
					this.emitWarning(new Error(`Language "${lang}" missing`));
					data[lang] = data[defaultLanguage];
				}
			})
	);
	return JSON.stringify(data);
};

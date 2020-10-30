const path = require('path');
const fs = require('fs');
const UglifyJS = require('uglify-es');

const directory = path.join(__dirname, '/datainmotion/static/scripts');
const target = path.join(__dirname, '/datainmotion/static/compressed');

fs.readdir(directory, function (err, files) {
	if (err) {
		return console.log('Unable to reach', directory, err);
	}
	files.forEach(function (file) {
		fs.readFile(directory + '/' + file, 'utf-8', function (err, data) {
			if (err) {
				console.error(err);
				return;
			}
			// console.log(data);
			const filename = `${directory}/${file}`;
			const code = {};
			code[filename] = data;
			const options = {
				compress: {
					drop_console: true
				}
			}
			const minCode = UglifyJS.minify(code, options);
			// console.log(minCode);
			if (minCode.error) {
				console.error(minCode.error);
				return;
			}
			fs.writeFileSync(target + '/' + file, minCode.code, 'utf8');
		});
	});
});
const htmlDir = path.join(__dirname, '/datainmotion/templates')
fs.readdir(htmlDir, function (err, files) {
	if (err) {
		return console.log('Unable to reach', directory, err);
	}
	const target = path.join(__dirname, '/datainmotion/prod_templates');
	files.forEach(function (file) {
		fs.readFile(htmlDir + '/' + file, 'utf-8', function (err, data) {
			if (err) {
				console.error(err);
				return;
			}
			console.log(file);
			const parsedData = data.replace(/static\/scripts/g, 'static/compressed');
			fs.writeFileSync(target + '/' + file, parsedData, 'utf8');
		});
	});
});
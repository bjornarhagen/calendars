const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({ // define where to save the file
	filename: './dist/css/[name].css',
	allChunks: true,
});

module.exports = {
	entry: ['./app.js', './src/scss/calendars.scss'],
	output: {
		filename: './dist/js/app.js'
	},
	module: {
		rules: [
			{
				test: /\.(sass|scss)$/,
					use: extractSass.extract({
					use: [{
						loader: "css-loader"
					}, {
						loader: "sass-loader"
					}],
					// use style-loader in development
					fallback: "style-loader"
				})
			}
		]
	},
	plugins: [
		extractSass,
		new CopyWebpackPlugin([
			{ from: './src/html/index.html', to: __dirname+'/dist/index.html' },
		])
	]
}
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		main: "./App.js"
	},

	output: {
		path: __dirname,
		filename: "./bundles/[name].js"
	},

	watch:true,

	devtool: 'source-map',

	module: {
		loaders: [
//			{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader?loose=es6.classes"},
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
			{ test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")},
			{ test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader")}
		]
	},

	plugins: [
		new ExtractTextPlugin("./bundles/[name].css")
	]
};

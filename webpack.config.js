//var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		demo: "./examples/demo/App.js",
		tests: "./spec/main.js",
		simple: "./examples/simple/main.js",
		simpleWithAdd: "./examples/simpleWithAdd/main.js"
	},

	output: {
		path: __dirname,
		filename: "./bundles/[name].js"
	},

	//resolve : {
	//	alias: {
	//		css      :  "/web/css"
	//	}
	//},

	watch:true,

	devtool: 'source-map',

	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader?loose=es6.classes"},
			{ test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")},
			{ test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader")}
		]
	},

	plugins: [
		new ExtractTextPlugin("./bundles/[name].css")
	]
};


var JsDocPlugin = require('jsdoc-webpack-plugin');

module.exports = {
	entry: {
		flexlayout: "./src/index.js"
	},

	output: {
		path: __dirname,
		library: "FlexLayout",
		libraryTarget:"umd",
		filename: "./dist/[name].js"
	},
	externals: {
		react: {
			root: 'React',
			commonjs: 'react',
			commonjs2: 'react',
			amd: 'react'
		},
		"react-dom":{
			root: 'ReactDOM',
			commonjs: 'react-dom',
			commonjs2: 'react-dom',
			amd: 'react-dom'
		}
	},
	module: {
		loaders: [
			{ test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			}
		]
	},
	plugins: [
		new JsDocPlugin({
			conf: './jsdoc.conf'
		})
	]
};

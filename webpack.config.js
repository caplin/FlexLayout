
const path = require('path');
module.exports = {
    mode: "development",
    entry: {
        demo: "./examples/demo/App.tsx",
    },

    output: {
        path: __dirname,
        filename: "./bundles/[name].js",
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
    },

    devServer: {
        static: "./",
        client: {
            overlay: false,
        },
    },

    devtool: "source-map",

    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',  // This handles font files
                generator: {
                    filename: 'fonts/[name][hash][ext]',  // Place fonts in a "fonts" folder inside the output directory
                },
            },
        ],
    },
};

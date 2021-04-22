const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack');

module.exports = function (env, argv) {

    let plugins = [
        new VueLoaderPlugin(),
        new webpack.ProvidePlugin({
            Vue: ['vue/dist/vue.esm.js', 'default']
        }),
        new HtmlWebpackPlugin(
            {
                title: 'index',
                filename: `index.html`,
                chunks: ['index'],
                template: `./src/template.html`,
            }
        ),
        new CopyPlugin({
            patterns: [{ from: 'src/assets', to: 'assets' }, { from: 'src/styles', to: 'styles' },]
        })
    ];

    let config = {
        mode: 'development',
        devtool: 'eval-source-map',
        output: {
            filename: '[name].[contenthash].js',
            path: path.resolve(__dirname, 'out'),
            library: '[name]',
        },
        entry: {
            'index': './src/index.js'
        },
        plugins: plugins,
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        'vue-style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                esModule: false
                            }
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        'file-loader'
                    ]
                },
                {
                    test: /\.(ico)$/,
                    loader: 'url'
                },
            ]
        }
    };
    return config;
}
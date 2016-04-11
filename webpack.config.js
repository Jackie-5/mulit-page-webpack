/**
 * Created by JackieWu
 * 多页面的webpack配置
 */
const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');

// 页面名字
const pageName = ['index','list'];
// 页面引入的js的链接
const fileLink = ['./src/js/index.js','./src/js/list.js'];
// 需要copy的文件 如自定义的文件名或者文件夹
const copyFile = [];
// 读取 package.json文件生成的版本号
const INFO = JSON.parse(fs.readFileSync('./package.json'));
// npm 指令
const ENV = process.env.npm_lifecycle_event;
// 输出的js文件路径和css路径
const publishLink = ENV === 'beta' ? 'http://some.beta.com/' : 'http://some.publish.com/';


module.exports = (() => {
    const config = {};
    config.plugins = [];
    config.entry = {};
    config.output = {};
    // 入口页面
    pageName.forEach((item, i)=> {
        config.entry[item] = fileLink[i];
        config.plugins.push(
            new HtmlWebpackPlugin({
                filename: './' + item + '.html',
                template: './src/' + item + '.html',
                inject: 'body',
                chunks: [item, 'common']
            })
        );
    });
    // 输出配置
    config.output = {
        path: path.join(__dirname, 'build'), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
        filename: 'js/[name].js',            //每个页面对应的主js的生成配置
        chunkFilename: 'js/[id].chunk.js'   //chunk生成的配置
    };

    if (ENV !== 'server' && ENV !== 'build') {
        config.output.publicPath = publishLink + INFO.name + '/' + INFO.version + '/'
    }

    if (ENV === 'build' || ENV === 'publish') {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin())
    }

    config.devtool = ENV === 'build' ? 'inline-source-map' : 'cheap-module-inline-source-map';

    config.module = {
        loaders: [
            {
                // HTML LOADER
                // Reference: https://github.com/webpack/raw-loader
                // Allow loading html through js
                test: /\.html$/,
                loader: 'raw'
            },
            {
                test: [/\.js$/, /\.jsx$/],
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react'],
                    compact: true
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                loader: 'path-file-loader',
                query: {
                    name: '[name].[hash].[ext]',
                    publicPath: './images/',
                    cssPath: '../images/'
                }
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader!less-loader")
            }
        ]
    };
    /**
     * PostCSS
     * Reference: https://github.com/postcss/autoprefixer-core
     * Add vendor prefixes to your css
     */
    config.postcss = [
        autoprefixer({
                browsers: ['last 2 versions']
            }
        )
    ];

    config.plugins.push(
        new CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new ExtractTextPlugin('css/[name].css'),
        // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
        // Dedupe modules in the output
        new webpack.optimize.DedupePlugin()
    );

    copyFile.forEach((item)=> {
        config.plugins.push(
            new CopyWebpackPlugin([
                {
                    from: './src/' + item + '/',
                    to: './' + item
                }
            ])
        );
    });

    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {
        contentBase: './src',
        stats: 'minimal'
    };


    return config;
})();

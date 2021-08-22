var PACKAGE = require('./package.json');
var version = PACKAGE.version;
const path = require('path');
const { merge } = require('webpack-merge');
const webpackConfig = require('./webpack.config.common');

module.exports = merge(webpackConfig, {

    mode: 'production',

    output: {
        path: path.join(__dirname, 'dist'),
        filename: (chunkData) => {
            switch(chunkData.chunk.name){
                case 'gz-exobit':
                case 'art-generator':
                    return `[name]-${version}.js`;
                default: return '[name].[chunkhash:8].js';
            }
        }
    }

});

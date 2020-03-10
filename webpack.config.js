var path = require('path');

module.exports = {
    mode: 'production',
    entry: './Components/formydable',
    externals : {
        react: 'react',
        'mytabworks-utils': 'mytabworks-utils'
    },
    output: {
        path: path.resolve('lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)?$/,
                exclude: /(node_modules)/,
                use: 'babel-loader'
            },
            {
                test: /\.css?$/, 
                exclude: /(node_modules)/,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
}
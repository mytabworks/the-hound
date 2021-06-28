const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path")
const entry = path.resolve(__dirname, '../src/index.ts')

module.exports = (styleRoot) => ({
  mode: 'production',
  entry,
  output: {
      path: styleRoot,
      filename: "js/index.js",
  },
  module: {
    rules: [
      {
        test: /\.(?:scss|css)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
        // fixed bug and bring css output when mode is production
        sideEffects: true,
      },
    ],
  },
  resolve: {
      alias: {
        "@styles": path.resolve(__dirname, '../src/assets/styles'),
      }
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: `css/main.css`,
    }),
  ],
})

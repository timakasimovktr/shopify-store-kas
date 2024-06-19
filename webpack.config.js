const path = require("path");
const webpack = require("webpack");
require("dotenv").config({ path: ".env" });
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const miniCss = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const paths = {
  mainPath: "/",
  fonts: "source/fonts//*",
  images: "source/images//*",
  styles: "source/scss/main.scss",
  main: "source/js/main.js",
  products: "source/js/products.js",
  checkout: "source/js/checkout/checkout.js",
  vuePath: "source/js/products/customizer//*.vue",
  purgecssPath: [".//*.html", "./**/*.liquid"],
  destination: "assets",
};

const plugins = (isDevelopment) => {
  const base = [
    new VueLoaderPlugin(),
    !isDevelopment &&
      new CopyPlugin({
        patterns: [
          {
            from: paths.images,
            to: path.resolve(__dirname, "assets/[name].[ext]"),
          },
          {
            from: paths.fonts,
            to: path.resolve(__dirname, "assets/[name].[ext]"),
          },
        ],
        options: {
          concurrency: 100,
        },
      }),
    new miniCss({
      filename: "bundle.min.css.liquid",
    }),
  ].filter(Boolean);
  return base;
};

module.exports = function(_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    entry: {
      scss: path.resolve(__dirname, paths.styles),
      bundle: path.resolve(__dirname, paths.main),
      checkout: path.resolve(__dirname, paths.checkout),
      products: path.resolve(__dirname, paths.products),
    },
    watchOptions: {
      aggregateTimeout: 400,
      poll: 1000,
    },

    output: {
      path: path.resolve(__dirname, "assets"),
      filename: "[name].min.js",
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.vue$/,
          loader: "vue-loader",
        },
        {
          test: /\.s?css$/,
          use: [
            miniCss.loader,
            {
              loader: "css-loader",
              options: {
                minimize: true,
                sourceMap: true,
              },
            },
            "sass-loader",
          ],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "./source"),
        "@@": path.resolve(__dirname, "./"),
      },
    },
    plugins: plugins(isDevelopment),
    optimization: {
      minimize: true,
      minimizer: [!isDevelopment && new UglifyJsPlugin()].filter(Boolean),
    },
  };
};
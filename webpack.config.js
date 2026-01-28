//@ts-check
"use strict";
const path = require("path");

// Use source maps only in development mode for smaller production bundles.
const isProduction = process.env.NODE_ENV === "production";
const devtool = isProduction ? false : "source-map";

/**@type {import('webpack').Configuration[]}*/
const configs = [
  // Config for the Extension's runtime code
  {
    target: "node",
    mode: "production",
    entry: "./extension.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "extension.js",
      libraryTarget: "commonjs2",
    },
    externals: {
      vscode: "commonjs vscode",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
      ],
    },
    devtool,
  },
  // Config for the build script
  {
    target: "node",
    mode: "production",
    entry: "./build.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "build.js",
      libraryTarget: "commonjs",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
      ],
    },
    devtool,
  },
  // Config for the webview's main logic script
  {
    target: "web",
    mode: "production",
    entry: "./webview/main.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "webview.js",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
      ],
    },
    devtool,
  },
];
module.exports = configs;

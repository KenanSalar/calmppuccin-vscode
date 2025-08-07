//@ts-check
"use strict";
const path = require("path");

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
    devtool: "source-map",
  },
  // Config for the build script
  {
    target: "node",
    mode: "none",
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
  },
  {
    target: "web",
    mode: "production",
    entry: "./webview/main.ts", // Entry point for the webview script
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "webview.js", // Output file
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
    devtool: "source-map",
  },
];
module.exports = configs;

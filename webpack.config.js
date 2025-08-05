//@ts-check
"use strict";
const path = require("path");

/**@type {import('webpack').Configuration[]}*/
const configs = [
  // Config for the Extension's runtime code
  {
    target: "node",
    mode: "none",
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
];
module.exports = configs;

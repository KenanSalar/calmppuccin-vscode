//@ts-check
"use strict";
const path = require("path");

// Use source maps only in development mode for smaller production bundles.
const isProduction = process.env.NODE_ENV === "production";
const mode = isProduction ? "production" : "development";
const devtool = isProduction ? false : "source-map";

// Type errors are reported by `npm run type-check`, a required PR check, so the build only transpiles.
const typescriptRules = [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
  },
];

const distPath = path.resolve(__dirname, "dist");

/**@type {import('webpack').Configuration}*/
const sharedConfig = {
  mode,
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: { rules: typescriptRules },
  devtool,
};

/**@type {import('webpack').Configuration[]}*/
const configs = [
  // Config for the Extension's runtime code
  {
    ...sharedConfig,
    target: "node",
    entry: "./extension.ts",
    output: {
      path: distPath,
      filename: "extension.js",
      libraryTarget: "commonjs2",
    },
    externals: {
      vscode: "commonjs vscode",
    },
  },
  // Config for the build script
  {
    ...sharedConfig,
    target: "node",
    entry: "./build.ts",
    output: {
      path: distPath,
      filename: "build.js",
      libraryTarget: "commonjs",
    },
  },
  // Config for the webview's main logic script
  {
    ...sharedConfig,
    target: "web",
    entry: "./webview/main.ts",
    output: {
      path: distPath,
      filename: "webview.js",
    },
  },
];
module.exports = configs;

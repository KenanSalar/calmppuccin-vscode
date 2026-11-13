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

// Each extension host supplies the `vscode` module at runtime.
const externals = { vscode: "commonjs vscode" };

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
    externals,
  },
  // Config for the web extension host, a Web Worker: webpack 5 polyfills no Node module, so an
  // import that reaches `fs` or `path` fails the build rather than the extension.
  {
    ...sharedConfig,
    target: "webworker",
    entry: "./browser.ts",
    output: {
      path: distPath,
      filename: "browser.js",
      libraryTarget: "commonjs2",
    },
    externals,
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

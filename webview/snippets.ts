/**
 * @file This file aggregates all language-specific code snippets into a single, easily importable object.
 * This object is used by the webview's live preview pane to display different code samples.
 */

import { cSnippet } from "./snippets/c";
import { cppSnippet } from "./snippets/cpp";
import { csharpSnippet } from "./snippets/csharp";
import { cssSnippet } from "./snippets/css";
import { goSnippet } from "./snippets/go";
import { htmlSnippet } from "./snippets/html";
import { javaSnippet } from "./snippets/java";
import { javascriptSnippet } from "./snippets/javascript";
import { kotlinSnippet } from "./snippets/kotlin";
import { luaSnippet } from "./snippets/lua";
import { phpSnippet } from "./snippets/php";
import { pythonSnippet } from "./snippets/python";
import { rustSnippet } from "./snippets/rust"; // TODO
import { shellSnippet } from "./snippets/shell"; // TODO
import { sqlSnippet } from "./snippets/sql"; // TODO
import { swiftSnippet } from "./snippets/swift"; // TODO
import { typescriptSnippet } from "./snippets/typescript";

/**
 * Defines the shape for the code snippets object.
 * It's a dictionary mapping a language identifier (string) to its corresponding HTML snippet (string).
 */
export type CodeSnippets = {
  [language: string]: string;
};

/**
 * The main exported object containing all code snippets for the live preview.
 * The keys of this object (e.g., "csharp", "python") are used to populate the language selector dropdown in the UI.
 */
export const codeSnippets: CodeSnippets = {
  c: cSnippet,
  "c++": cppSnippet,
  csharp: csharpSnippet,
  css: cssSnippet,
  go: goSnippet,
  html: htmlSnippet,
  java: javaSnippet,
  javascript: javascriptSnippet,
  kotlin: kotlinSnippet,
  lua: luaSnippet,
  php: phpSnippet,
  python: pythonSnippet,
  rust: rustSnippet,
  shell: shellSnippet,
  sql: sqlSnippet,
  swift: swiftSnippet,
  typescript: typescriptSnippet,
};

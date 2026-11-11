/**
 * @file The preview's sample code by language. Every key but `brackets`, `json` and `ui` is a
 * choice in the language dropdown.
 */

import { bracketsSnippet } from "./snippets/brackets";
import { cSnippet } from "./snippets/c";
import { cppSnippet } from "./snippets/cpp";
import { csharpSnippet } from "./snippets/csharp";
import { cssSnippet } from "./snippets/css";
import { dartSnippet } from "./snippets/dart";
import { goSnippet } from "./snippets/go";
import { htmlSnippet } from "./snippets/html";
import { javaSnippet } from "./snippets/java";
import { javascriptSnippet } from "./snippets/javascript";
import { jsonSnippet } from "./snippets/json";
import { kotlinSnippet } from "./snippets/kotlin";
import { luaSnippet } from "./snippets/lua";
import { phpSnippet } from "./snippets/php";
import { pythonSnippet } from "./snippets/python";
import { rustSnippet } from "./snippets/rust";
import { shellSnippet } from "./snippets/shell";
import { sqlSnippet } from "./snippets/sql";
import { typescriptSnippet } from "./snippets/typescript";
import { uiSnippet } from "./snippets/ui";

export type CodeSnippets = {
  [language: string]: string;
};

export const codeSnippets: CodeSnippets = {
  c: cSnippet,
  "c++": cppSnippet,
  csharp: csharpSnippet,
  dart: dartSnippet,
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
  typescript: typescriptSnippet,
  brackets: bracketsSnippet,
  json: jsonSnippet,
  ui: uiSnippet,
};

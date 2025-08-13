import { cSnippet } from "./snippets/c";
import { cppSnippet } from "./snippets/cpp";
import { csharpSnippet } from "./snippets/csharp";
import { cssSnippet } from "./snippets/css";
import { goSnippet } from "./snippets/go";
import { htmlSnippet } from "./snippets/html";
import { javaSnippet } from "./snippets/java";
// import { javascriptSnippet } from './snippets/javascript';
import { kotlinSnippet } from "./snippets/kotlin";
import { phpSnippet } from "./snippets/php";
import { pythonSnippet } from "./snippets/python";
import { rustSnippet } from "./snippets/rust";
import { sqlSnippet } from "./snippets/sql";
import { swiftSnippet } from "./snippets/swift";
import { typescriptSnippet } from "./snippets/typescript";

export type CodeSnippets = {
  [language: string]: string;
};

export const codeSnippets: CodeSnippets = {
  c: cSnippet,
  "c++": cppSnippet,
  csharp: csharpSnippet,
  css: cssSnippet,
  go: goSnippet,
  html: htmlSnippet,
  java: javaSnippet,
  // javascript: javascriptSnippet,
  kotlin: kotlinSnippet,
  php: phpSnippet,
  python: pythonSnippet,
  rust: rustSnippet,
  sql: sqlSnippet,
  swift: swiftSnippet,
  // typescript: typescriptSnippet,
};

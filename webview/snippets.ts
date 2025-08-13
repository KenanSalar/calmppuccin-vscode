import { cSnippet } from "./snippets/c";
import { cppSnippet } from "./snippets/cpp";
import { csharpSnippet } from "./snippets/csharp";
import { cssSnippet } from "./snippets/css";
import { goSnippet } from "./snippets/go"; // TODO
import { htmlSnippet } from "./snippets/html";
import { javaSnippet } from "./snippets/java"; // TODO
// import { javascriptSnippet } from './snippets/javascript'; // TODO
import { kotlinSnippet } from "./snippets/kotlin"; // TODO
import { luaSnippet } from "./snippets/lua"; // TODO
import { phpSnippet } from "./snippets/php"; // TODO
import { powershellSnippet } from "./snippets/powershell"; // TODO
import { pythonSnippet } from "./snippets/python";
import { rSnippet } from "./snippets/r"; // TODO
import { rubySnippet } from "./snippets/ruby"; // TODO
import { rustSnippet } from "./snippets/rust"; // TODO
// import { shellSnippet } from "./snippets/shell"; // TODO
import { sqlSnippet } from "./snippets/sql"; // TODO
import { swiftSnippet } from "./snippets/swift"; // TODO
// import { typescriptSnippet } from "./snippets/typescript"; // TODO

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
  lua: luaSnippet,
  php: phpSnippet,
  powershell: powershellSnippet,
  python: pythonSnippet,
  r: rSnippet,
  ruby: rubySnippet,
  rust: rustSnippet,
  // shell: shellSnippet,
  sql: sqlSnippet,
  swift: swiftSnippet,
  // typescript: typescriptSnippet,
};

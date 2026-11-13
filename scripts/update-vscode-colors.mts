/**
 * @file Writes VS Code's workbench color keys, and which of them are deprecated, to
 * `test/__fixtures__/workbenchColors.json` for checking `src/template.json` against. The fixture
 * names the extract-vscode-schemas commit it came from, so the check runs offline and its list
 * traces back to one VS Code release.
 */

import * as fs from "fs/promises";
import * as path from "path";

/** Commits the `vscode://schemas/…` resources of each stable VS Code release. */
const SCHEMA_REPO = "ota-meshi/extract-vscode-schemas";
const SCHEMA_BRANCH = "main";
const SCHEMA_PATH = "resources/vscode/schemas/workbench-colors.json";
const METADATA_PATH = "meta-data.json";
const DEFS_REF_PREFIX = "#/$defs/";
// Relative to the package root, where npm runs a script.
const FIXTURE_PATH = path.join("test", "__fixtures__", "workbenchColors.json");

interface IColorSchema {
  properties: Readonly<Record<string, unknown>>;
  defs: Readonly<Record<string, unknown>>;
}

async function main(): Promise<void> {
  const commit = await getHeadCommit();
  const rawBase = `https://raw.githubusercontent.com/${SCHEMA_REPO}/${commit}`;
  const [schemaJson, metadataJson] = await Promise.all([
    getJson(`${rawBase}/${SCHEMA_PATH}`),
    getJson(`${rawBase}/${METADATA_PATH}`),
  ]);
  const schema = parseSchema(schemaJson);
  const colors = Object.keys(schema.properties).toSorted();
  const fixture = {
    vscodeVersion: parseVscodeVersion(metadataJson),
    source: `https://github.com/${SCHEMA_REPO}/blob/${commit}/${SCHEMA_PATH}`,
    colors,
    deprecated: colors.filter((key) => isDeprecated(schema.properties[key], schema.defs)),
  };

  await fs.writeFile(FIXTURE_PATH, `${JSON.stringify(fixture, null, 2)}\n`);
  const counts = `${String(colors.length)} colors, ${String(fixture.deprecated.length)} deprecated`;
  console.log(`${FIXTURE_PATH}: ${counts}, from VS Code ${fixture.vscodeVersion}`);
}

/** Pins both downloads to one commit, as the branch can move between them. */
async function getHeadCommit(): Promise<string> {
  const url = `https://api.github.com/repos/${SCHEMA_REPO}/commits/${SCHEMA_BRANCH}`;
  const response = await getResponse(url, { Accept: "application/vnd.github.sha" });
  return response.text();
}

async function getJson(url: string): Promise<unknown> {
  const response = await getResponse(url);
  return response.json();
}

async function getResponse(url: string, headers?: Record<string, string>): Promise<Response> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GET ${url} answered ${String(response.status)} ${response.statusText}`);
  }
  return response;
}

function parseSchema(json: unknown): IColorSchema {
  if (!isPlainObject(json)) {
    throw new Error("The schema isn't a JSON object");
  }
  const { properties, $defs: defs = {} } = json;
  if (!isPlainObject(properties) || Object.keys(properties).length === 0) {
    throw new Error("The schema lists no color properties");
  }
  if (!isPlainObject(defs)) {
    throw new Error("The schema's $defs isn't an object");
  }
  return { properties, defs };
}

function parseVscodeVersion(json: unknown): string {
  if (!isPlainObject(json) || typeof json.vscodeVersion !== "string") {
    throw new Error(`${METADATA_PATH} names no vscodeVersion`);
  }
  return json.vscodeVersion;
}

/**
 * Whether a key's definition carries a `deprecationMessage`. The schema stores a definition that
 * several keys share once under `$defs`, so the message can sit behind a `$ref`.
 */
function isDeprecated(node: unknown, defs: IColorSchema["defs"]): boolean {
  if (Array.isArray(node)) {
    return node.some((item) => isDeprecated(item, defs));
  }
  if (!isPlainObject(node)) {
    return false;
  }
  if (Object.hasOwn(node, "deprecationMessage")) {
    return true;
  }
  const referenced = typeof node.$ref === "string" ? resolveRef(node.$ref, defs) : undefined;
  return (
    isDeprecated(referenced, defs) || Object.values(node).some((value) => isDeprecated(value, defs))
  );
}

function resolveRef(ref: string, defs: IColorSchema["defs"]): unknown {
  const name = ref.slice(DEFS_REF_PREFIX.length);
  if (!ref.startsWith(DEFS_REF_PREFIX) || !Object.hasOwn(defs, name)) {
    throw new Error(`The schema points to ${ref}, which its $defs doesn't hold`);
  }
  return defs[name];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

/** @file `removeOverrideKey` and `toProfiles`, which need no `vscode` mock. */

import { removeOverrideKey, toProfiles } from "../../src/config/ConfigAccess";

describe("removeOverrideKey", () => {
  it("should return original object when key doesn't exist in flavor", () => {
    const input = { mocha: { a: "1" } };
    const result = removeOverrideKey(input, "mocha", "b");

    expect(result).toBe(input);
  });

  it("should return original object when flavor doesn't exist", () => {
    const input = { mocha: { a: "1" } };
    const result = removeOverrideKey(input, "latte", "a");

    expect(result).toBe(input);
  });

  it("should remove one of multiple keys in a flavor", () => {
    const input = { mocha: { a: "1", b: "2" } };
    const result = removeOverrideKey(input, "mocha", "a");

    expect(result).toEqual({ mocha: { b: "2" } });
    expect(result).not.toBe(input);
  });

  it("should remove the flavor when its last key is removed", () => {
    const input = { mocha: { a: "1" }, latte: { b: "2" } };
    const result = removeOverrideKey(input, "mocha", "a");

    expect(result).toEqual({ latte: { b: "2" } });
  });

  it("should return undefined when the last key in the last flavor is removed", () => {
    const input = { mocha: { a: "1" } };
    const result = removeOverrideKey(input, "mocha", "a");

    expect(result).toBeUndefined();
  });

  it("should return original object when flavor value is undefined", () => {
    const input: { mocha: { [key: string]: string } | undefined } = { mocha: undefined };
    const result = removeOverrideKey(input, "mocha", "a");

    expect(result).toBe(input);
  });

  it("should return original object when the key is only inherited", () => {
    const input = { mocha: { a: "1" } };
    const result = removeOverrideKey(input, "mocha", "constructor");

    expect(result).toBe(input);
  });
});

describe("toProfiles", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an array", [{ accent: "red" }]],
    ["a string", "Default"],
  ])("should give only Default for %s", (_label, raw) => {
    expect(toProfiles(raw)).toStrictEqual({ Default: {} });
  });

  it("should drop entries that aren't objects and keep the rest", () => {
    const raw = { Default: null, Work: { accent: "red" }, Broken: [1], Text: "x" };

    expect(toProfiles(raw)).toStrictEqual({ Default: {}, Work: { accent: "red" } });
  });

  it("should keep a profile named __proto__ as its own entry", () => {
    const raw: unknown = JSON.parse('{ "__proto__": { "accent": "red" } }');

    expect(Object.keys(toProfiles(raw)).toSorted()).toStrictEqual(["Default", "__proto__"]);
  });

  it("should keep an existing Default profile", () => {
    expect(toProfiles({ Default: { accent: "mauve" } })).toStrictEqual({
      Default: { accent: "mauve" },
    });
  });
});

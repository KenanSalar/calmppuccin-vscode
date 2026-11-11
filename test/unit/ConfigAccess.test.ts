/** @file `cloneOverrides` and `removeOverrideKey`, which need no `vscode` mock. */

import { cloneOverrides, removeOverrideKey, toProfiles } from "../../src/config/ConfigAccess";

describe("cloneOverrides", () => {
  it("should return a new empty object for empty input", () => {
    const input = {} as Record<string, Record<string, string>>;
    const result = cloneOverrides(input);

    expect(result).toEqual({});
    expect(result).not.toBe(input);
  });

  it("should deep clone a single flavor with a single key", () => {
    const input = { mocha: { base: "#111" } };
    const result = cloneOverrides(input);

    expect(result).toEqual({ mocha: { base: "#111" } });
    expect(result).not.toBe(input);
    expect(result.mocha).not.toBe(input.mocha);
  });

  it("should deep clone multiple flavors independently", () => {
    const input = { mocha: { a: "1" }, latte: { b: "2" } };
    const result = cloneOverrides(input);

    expect(result).toEqual({ mocha: { a: "1" }, latte: { b: "2" } });
    expect(result.mocha).not.toBe(input.mocha);
    expect(result.latte).not.toBe(input.latte);
  });
});

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

  it("should keep an existing Default profile", () => {
    expect(toProfiles({ Default: { accent: "mauve" } })).toStrictEqual({
      Default: { accent: "mauve" },
    });
  });
});

/**
 * @file Unit tests for the pure utility functions in ConfigAccess.
 * Tests cloneOverrides() and removeOverrideKey() edge cases.
 */

import { cloneOverrides, removeOverrideKey } from "../../src/config/ConfigAccess";

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

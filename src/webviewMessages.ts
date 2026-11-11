/**
 * @file Checks a message from the customization webview before anything acts on it.
 * `onDidReceiveMessage` delivers whatever the page posted, so `MessageToExtension` is only a
 * claim until every field has been checked against what the settings accept.
 */

import { MessageToExtension } from "../types/webview";
import { getAccentOptions, getDefaultFontStyles, isFlavor } from "./config/ConfigAccess";
import * as C from "./constants";

type MessageFields = Partial<Record<string, unknown>>;
type MessageParser = (fields: MessageFields) => MessageToExtension | undefined;

const COMMANDS = C.WEBVIEW_CONSTANTS;
const COLOR_KEYS: ReadonlySet<string> = new Set([
  ...C.CUSTOMIZABLE_SYNTAX_KEYS,
  ...C.CUSTOMIZABLE_BRACKET_KEYS,
  ...C.CUSTOMIZABLE_JSON_KEYS,
  ...C.CUSTOMIZABLE_UI_KEYS,
]);
const HEX6_COLOR = /^#[0-9A-Fa-f]{6}$/;
const HEX_COLOR_WITH_ALPHA = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

// `uiText` arrives as a syntax color: the webview sends only base, mantle and crust as UI colors.
const PARSERS = {
  [COMMANDS.UPDATE_SETTING]: ({ key, value }) =>
    isFontStyleKey(key) && isFontStyle(value)
      ? { command: COMMANDS.UPDATE_SETTING, key, value }
      : undefined,
  [COMMANDS.RESET_FONT_STYLE]: ({ key }) =>
    isFontStyleKey(key) ? { command: COMMANDS.RESET_FONT_STYLE, key } : undefined,
  [COMMANDS.UPDATE_ACCENT]: ({ value }) =>
    isAccent(value) ? { command: COMMANDS.UPDATE_ACCENT, value } : undefined,
  [COMMANDS.UPDATE_CUSTOM_ACCENT]: ({ value }) =>
    matches(value, HEX6_COLOR) ? { command: COMMANDS.UPDATE_CUSTOM_ACCENT, value } : undefined,
  [COMMANDS.UPDATE_SYNTAX_COLOR]: ({ flavor, key, value }) =>
    isFlavorName(flavor) && isColorKey(key) && matches(value, HEX_COLOR_WITH_ALPHA)
      ? { command: COMMANDS.UPDATE_SYNTAX_COLOR, flavor, key, value }
      : undefined,
  [COMMANDS.RESET_SYNTAX_COLOR]: ({ flavor, key }) =>
    isFlavorName(flavor) && isColorKey(key)
      ? { command: COMMANDS.RESET_SYNTAX_COLOR, flavor, key }
      : undefined,
  [COMMANDS.UPDATE_UI_COLOR]: ({ flavor, key, value }) =>
    isFlavorName(flavor) && isColorKey(key) && matches(value, HEX6_COLOR)
      ? { command: COMMANDS.UPDATE_UI_COLOR, flavor, key, value }
      : undefined,
  [COMMANDS.RESET_UI_COLOR]: ({ flavor, key }) =>
    isFlavorName(flavor) && isColorKey(key)
      ? { command: COMMANDS.RESET_UI_COLOR, flavor, key }
      : undefined,
  [COMMANDS.RESET_ALL]: () => ({ command: COMMANDS.RESET_ALL }),
  [COMMANDS.SWITCH_PROFILE]: ({ profile }) =>
    isProfileName(profile) ? { command: COMMANDS.SWITCH_PROFILE, profile } : undefined,
  [COMMANDS.SAVE_PROFILE]: ({ profile }) =>
    isProfileName(profile) ? { command: COMMANDS.SAVE_PROFILE, profile } : undefined,
  [COMMANDS.DELETE_PROFILE]: ({ profile }) =>
    isProfileName(profile) ? { command: COMMANDS.DELETE_PROFILE, profile } : undefined,
} satisfies Record<MessageToExtension["command"], MessageParser>;

/**
 * Returns the message the webview posted when its command and every field are valid, rebuilt
 * from those fields alone, and `undefined` otherwise.
 * @param raw The value `onDidReceiveMessage` delivered.
 */
export function parseWebviewMessage(raw: unknown): MessageToExtension | undefined {
  if (typeof raw !== "object" || raw === null) {
    return undefined;
  }
  const fields = raw as MessageFields;
  const { command } = fields;
  if (typeof command !== "string" || !isCommand(command)) {
    return undefined;
  }
  return PARSERS[command](fields);
}

function isCommand(command: string): command is keyof typeof PARSERS {
  return Object.hasOwn(PARSERS, command);
}

function isFontStyleKey(value: unknown): value is string {
  return typeof value === "string" && Object.hasOwn(getDefaultFontStyles(), value);
}

function isFontStyle(value: unknown): value is string {
  return C.FONT_STYLE_OPTIONS.some((option) => option === value);
}

function isAccent(value: unknown): value is string {
  return typeof value === "string" && getAccentOptions().includes(value);
}

function isFlavorName(value: unknown): value is string {
  return typeof value === "string" && isFlavor(value);
}

function isColorKey(value: unknown): value is string {
  return typeof value === "string" && COLOR_KEYS.has(value);
}

function isProfileName(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function matches(value: unknown, pattern: RegExp): value is string {
  return typeof value === "string" && pattern.test(value);
}

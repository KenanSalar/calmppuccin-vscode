/** @file `deleteProfile`'s and `saveProfile`'s edge cases, against the `vscode` mock's configuration. */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("ConfigurationService Profile Management", () => {
  let mockConfiguration: { get: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);
  });

  /** Assigning `profiles["__proto__"]` sets the prototype, so the profile never reaches settings. */
  it("should save a profile named __proto__ as its own entry", async () => {
    mockConfiguration.get.mockImplementation((key: string) =>
      key === C.CONFIG_KEY_PROFILES ? { Default: {} } : undefined,
    );

    await ConfigurationService.saveProfile("__proto__");

    const [, savedProfiles] = mockConfiguration.update.mock.calls[0] as [string, object];
    expect(Object.keys(savedProfiles).toSorted()).toStrictEqual(["Default", "__proto__"]);
  });

  it("should prevent deletion of Default profile silently", async () => {
    mockConfiguration.get.mockReturnValue({ Default: {} });

    await ConfigurationService.deleteProfile("Default");

    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

  it("should switch to Default when deleting active profile", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return {
          Default: {},
          CustomProfile: { accent: "mauve" },
        };
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return "CustomProfile";
      return undefined;
    });

    await ConfigurationService.deleteProfile("CustomProfile");

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_ACTIVE_PROFILE,
      "Default",
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {}, // Empty because Default is empty and no custom profiles remain
      vscode.ConfigurationTarget.Global,
    );
  });

  it("should remove entire profiles setting when deleting last custom profile with empty Default", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return {
          Default: {},
          OnlyCustom: { accent: "pink" },
        };
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return "Default";
      return undefined;
    });

    await ConfigurationService.deleteProfile("OnlyCustom");

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {},
      vscode.ConfigurationTarget.Global,
    );
  });

  it("should keep Default profile when it has settings after deleting last custom profile", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return {
          Default: { accent: "lavender" },
          OnlyCustom: { accent: "pink" },
        };
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return "Default";
      return undefined;
    });

    await ConfigurationService.deleteProfile("OnlyCustom");

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      { Default: { accent: "lavender" } },
      vscode.ConfigurationTarget.Global,
    );
  });

  it("should handle deletion of non-existent profile gracefully", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return {
          Default: {},
          ExistingProfile: {},
        };
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return "Default";
      return undefined;
    });

    await expect(ConfigurationService.deleteProfile("NonExistent")).resolves.not.toThrow();

    expect(mockConfiguration.update).toHaveBeenCalled();
  });

  it("should delete only the specified profile when multiple custom profiles exist", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return {
          Default: {},
          Profile1: { accent: "mauve" },
          Profile2: { accent: "pink" },
          Profile3: { accent: "lavender" },
        };
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return "Default";
      return undefined;
    });

    await ConfigurationService.deleteProfile("Profile2");

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {},
        Profile1: { accent: "mauve" },
        Profile3: { accent: "lavender" },
      },
      vscode.ConfigurationTarget.Global,
    );
  });
});

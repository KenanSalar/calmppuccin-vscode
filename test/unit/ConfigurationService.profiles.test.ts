/**
 * @file ConfigurationService.profiles.test.ts
 * @description Tests for profile management edge cases including deletion,
 * switching, and state consistency validation.
 */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

/**
 * Test suite for profile deletion and management edge cases.
 */
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

  /**
   * @description Tests that deleteProfile prevents deletion of the Default profile.
   * @precondition Default profile exists in profiles
   * @assertion No updates should be made (deletion prevented silently)
   */
  it("should prevent deletion of Default profile silently", async () => {
    mockConfiguration.get.mockReturnValue({ Default: {} });

    await ConfigurationService.deleteProfile("Default");

    // Should silently return, no updates
    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that deleteProfile switches active profile to Default when deleting
   * the currently active profile.
   * @precondition Multiple profiles exist, active profile is being deleted
   * @assertion Active profile should be updated to Default and profile removed
   */
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

    // Should update active profile to Default
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_ACTIVE_PROFILE,
      "Default",
      vscode.ConfigurationTarget.Global
    );

    // Should remove entire profiles (Default is empty, so remove all)
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {}, // Empty because Default is empty and no custom profiles remain
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that deleteProfile removes entire profiles setting when deleting
   * last custom profile with empty Default.
   * @precondition Only Default (empty) and one custom profile exist
   * @assertion Profiles should be set to empty object (Default removed from storage)
   */
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

    // Should clear profiles entirely (Default is empty)
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {},
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that deleteProfile keeps Default profile when it has settings
   * after deleting last custom profile.
   * @precondition Default has settings, one custom profile exists
   * @assertion Default profile with settings should remain after deletion
   */
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

    // Should keep Default with its settings
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      { Default: { accent: "lavender" } },
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that deleteProfile handles deletion of non-existent profile gracefully.
   * @precondition Profile to delete does not exist
   * @assertion Should not throw error and should handle state correctly
   */
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

    // Should not throw error
    await expect(ConfigurationService.deleteProfile("NonExistent")).resolves.not.toThrow();

    // Should still update (attempting to delete non-existent profile)
    expect(mockConfiguration.update).toHaveBeenCalled();
  });

  /**
   * @description Tests that deleteProfile handles multiple custom profiles correctly.
   * @precondition Multiple custom profiles exist
   * @assertion Only specified profile should be deleted, others remain
   */
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

    // Should keep Default, Profile1, and Profile3
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {},
        Profile1: { accent: "mauve" },
        Profile3: { accent: "lavender" },
      },
      vscode.ConfigurationTarget.Global
    );
  });
});

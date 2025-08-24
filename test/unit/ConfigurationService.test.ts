import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

// We cast the imported vscode object to its mocked type to get type-safety on our mock.
const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("ConfigurationService Unit Tests", () => {
  let mockConfiguration: { get: jest.Mock };

  beforeEach(() => {
    // Clear any previous mock behavior between tests
    jest.clearAllMocks();

    mockConfiguration = {
      // The implementation correctly simulates the real API's fallback behavior
      get: jest.fn().mockImplementation((_key, defaultValue) => {
        // For this test, we assume the user has no setting, so we return the default.
        return defaultValue;
      }),
    };

    // Cast the function to jest.Mock to access mock-specific methods
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);
  });

  it("getAccent() should return the default accent color when no user setting is present", () => {
    // Act: Call the method we are testing.
    const accent = ConfigurationService.getAccent();

    // Assert: Check if the result is what we expect.
    expect(accent).toBe(C.DEFAULT_ACCENT);

    // Assert that the VS Code API was called correctly.
    expect(mockedVscode.workspace.getConfiguration).toHaveBeenCalledWith(C.EXTENSION_NAMESPACE);
    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  });
});

/** @file `WebviewManager`'s panel lifecycle, with a file-local `vscode` mock and `fs/promises`. */

import * as fs from "fs/promises";
import * as vscode from "vscode";
import * as C from "../../src/constants";
import { WebviewManager } from "../../src/WebviewManager";
import { MessageToWebview } from "../../types/webview";

jest.mock("fs/promises");

// A file-local `vscode`: the shared mock has no `window.createWebviewPanel`.
jest.mock("vscode", () => ({
  window: {
    createWebviewPanel: jest.fn(),
  },
  ViewColumn: {
    One: 1,
  },
  Uri: {
    file: jest.fn((filePath: string) => ({
      fsPath: filePath,
      with: jest.fn(),
    })),
  },
}));

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("WebviewManager Unit Tests", () => {
  let mockContext: vscode.ExtensionContext;
  let mockPanel: vscode.WebviewPanel;
  let disposeSpy: jest.SpyInstance;
  let revealMock: jest.Mock;
  let postMessageMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockDispose = jest.fn();
    disposeSpy = jest.spyOn({ dispose: mockDispose }, "dispose");

    revealMock = jest.fn();
    postMessageMock = jest.fn().mockResolvedValue(true);

    mockPanel = {
      webview: {
        html: "",
        onDidReceiveMessage: jest.fn(),
        postMessage: postMessageMock,
        asWebviewUri: jest.fn((uri: vscode.Uri) => uri),
        cspSource: "https://mock.csp.source",
      },
      onDidDispose: jest.fn(),
      reveal: revealMock,
      dispose: disposeSpy,
    } as unknown as vscode.WebviewPanel;

    mockContext = {
      extensionPath: "/mock/extension/path",
    } as vscode.ExtensionContext;

    (mockedVscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockPanel);

    // A `</head>` for the CSP to land before.
    (fs.readFile as jest.Mock).mockResolvedValue(
      "<html><head></head><body>webview.js style.css</body></html>",
    );

    WebviewManager.currentPanel = undefined;
  });

  it("should create a new panel if one does not exist", async () => {
    await WebviewManager.createOrShow(mockContext, jest.fn());

    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledWith(
      C.WEBVIEW_CONSTANTS.WEBVIEW_ID,
      C.WEBVIEW_CONSTANTS.WEBVIEW_TITLE,
      vscode.ViewColumn.One,
      expect.any(Object),
    );

    expect(WebviewManager.currentPanel).toBeInstanceOf(WebviewManager);
    expect(mockPanel.webview.html).toContain("<html>");
  });

  it("should reveal the existing panel if one already exists", async () => {
    await WebviewManager.createOrShow(mockContext, jest.fn());

    await WebviewManager.createOrShow(mockContext, jest.fn());

    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    expect(revealMock).toHaveBeenCalledTimes(1);
    expect(revealMock).toHaveBeenCalledWith(vscode.ViewColumn.One);
  });

  it("should delegate postMessage to the underlying webview's postMessage method", async () => {
    const testMessage: MessageToWebview = {
      command: "loadSettings",
      settings: {} as unknown as import("../../types/webview").ISettingsPayload,
    };
    await WebviewManager.createOrShow(mockContext, jest.fn());

    WebviewManager.currentPanel?.postMessage(testMessage);

    expect(postMessageMock).toHaveBeenCalledTimes(1);
    expect(postMessageMock).toHaveBeenCalledWith(testMessage);
  });

  it("should inject a Content-Security-Policy meta tag into the HTML", async () => {
    await WebviewManager.createOrShow(mockContext, jest.fn());

    expect(mockPanel.webview.html).toContain("Content-Security-Policy");
    expect(mockPanel.webview.html).toContain("img-src https://mock.csp.source https: data:");
    expect(mockPanel.webview.html).toContain("https://mock.csp.source");
  });

  it("should call dispose on the panel and reset the static instance", async () => {
    await WebviewManager.createOrShow(mockContext, jest.fn());
    const panelInstance = WebviewManager.currentPanel;

    panelInstance?.dispose();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(WebviewManager.currentPanel).toBeUndefined();
  });

  it("should be safe to call dispose() twice (idempotent)", async () => {
    await WebviewManager.createOrShow(mockContext, jest.fn());
    const panelInstance = WebviewManager.currentPanel;

    panelInstance?.dispose();
    panelInstance?.dispose();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(WebviewManager.currentPanel).toBeUndefined();
  });
});

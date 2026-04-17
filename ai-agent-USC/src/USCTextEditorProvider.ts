import * as vscode from "vscode";
import {
  parseBoardDocument,
  stringifyBoardDocument,
} from "./core/userStoryService";
import {
  WebviewInboundMessage,
  WebviewStateMessage,
} from "./core/types";
import { getWebviewHtml } from "./webview/htmlTemplate";

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";

  for (let i = 0; i < 32; i += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return value;
}

export class USCTextEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
      ],
    };

    const nonce = getNonce();
    webviewPanel.webview.html = getWebviewHtml({
      extensionUri: this.context.extensionUri,
      webview: webviewPanel.webview,
      nonce,
    });

    let applyingEditFromWebview = false;

    const sendStateToWebview = () => {
      const state = parseBoardDocument(document.getText());
      const message: WebviewStateMessage = {
        type: "setState",
        payload: state,
      };

      void webviewPanel.webview.postMessage(message);
    };

    sendStateToWebview();

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() !== document.uri.toString()) {
        return;
      }

      if (applyingEditFromWebview) {
        return;
      }

      sendStateToWebview();
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (message: WebviewInboundMessage) => {
      if (message.type !== "saveDocument") {
        return;
      }

      const newDocumentText = stringifyBoardDocument(message.payload);
      const fullDocumentRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length),
      );

      applyingEditFromWebview = true;

      try {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, fullDocumentRange, newDocumentText);

        const succeeded = await vscode.workspace.applyEdit(edit);

        if (!succeeded) {
          vscode.window.showErrorMessage("Unable to persist User Story changes.");
        }
      } finally {
        applyingEditFromWebview = false;
      }
    });
  }
}

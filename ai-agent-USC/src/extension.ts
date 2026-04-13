import * as vscode from "vscode";
import { USCTextEditorProvider } from "./USCTextEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerCustomEditorProvider(
    "ai-agent-USC.USC",
    new USCTextEditorProvider(context),
  );
}

export function deactivate() {}

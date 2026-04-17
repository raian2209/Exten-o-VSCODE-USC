import * as vscode from "vscode";
import { createDefaultBoard, stringifyBoardDocument } from "../core/userStoryService";

const USC_FILE_EXTENSION = ".usc.json";

export async function openUserStoryBoardCommand(): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  const now = new Date();
  const suggestedName = `story-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}${USC_FILE_EXTENSION}`;
  let targetUri: vscode.Uri | undefined;

  if (workspaceFolder) {
    const fileName = await vscode.window.showInputBox({
      prompt: "Enter the file name for the User Story board",
      value: suggestedName,
      validateInput: (value) =>
        value.trim().endsWith(USC_FILE_EXTENSION)
          ? undefined
          : `The file name must end with ${USC_FILE_EXTENSION}`,
    });

    if (!fileName) {
      return;
    }

    targetUri = vscode.Uri.joinPath(workspaceFolder.uri, fileName.trim());
  } else {
    targetUri = await vscode.window.showSaveDialog({
      saveLabel: "Create User Story Board",
      filters: {
        "User Story Board": ["usc.json"],
      },
      defaultUri: vscode.Uri.file(suggestedName),
    });

    if (!targetUri) {
      return;
    }

    if (!targetUri.path.endsWith(USC_FILE_EXTENSION)) {
      targetUri = targetUri.with({ path: `${targetUri.path}${USC_FILE_EXTENSION}` });
    }
  }

  try {
    await vscode.workspace.fs.stat(targetUri);
  } catch {
    const initialDocument = stringifyBoardDocument(createDefaultBoard());
    const bytes = Uint8Array.from(initialDocument, (char) => char.charCodeAt(0));
    await vscode.workspace.fs.writeFile(
      targetUri,
      bytes,
    );
  }

  const document = await vscode.workspace.openTextDocument(targetUri);
  await vscode.window.showTextDocument(document, { preview: false });
}

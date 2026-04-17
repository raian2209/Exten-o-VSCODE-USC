import * as vscode from 'vscode';
import { USCTextEditorProvider } from './USCTextEditorProvider';
import { openUserStoryBoardCommand } from './commands/openUserStoryBoardCommand';

const USC_EDITOR_VIEW_TYPE = 'ai-agent-USC.USC';

export function activate(context: vscode.ExtensionContext) {
	const provider = new USCTextEditorProvider(context);

	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(USC_EDITOR_VIEW_TYPE, provider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
			supportsMultipleEditorsPerDocument: false,
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'ai-agent-USC.openUserStoryBoard',
			openUserStoryBoardCommand,
		),
	);
}

export function deactivate() {}

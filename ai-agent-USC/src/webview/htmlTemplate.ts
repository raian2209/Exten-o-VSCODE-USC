import * as vscode from "vscode";

export interface HtmlTemplateInput {
  extensionUri: vscode.Uri;
  webview: vscode.Webview;
  nonce: string;
}

export function getWebviewHtml(input: HtmlTemplateInput): string {
  const styleUri = input.webview.asWebviewUri(
    vscode.Uri.joinPath(input.extensionUri, "media", "usc.css"),
  );

  const scriptUri = input.webview.asWebviewUri(
    vscode.Uri.joinPath(input.extensionUri, "media", "usc.js"),
  );

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${input.webview.cspSource}; script-src 'nonce-${input.nonce}';"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Story Board</title>
    <link rel="stylesheet" href="${styleUri}" />
  </head>
  <body>
    <div class="layout">
      <main class="main-panel">
        <header class="main-header">
          <h1 id="storyTitle">User Story</h1>
          <div class="mode-switch">
            <button type="button" class="mode-button is-active">Editor</button>
            <button type="button" class="mode-button">Preview</button>
          </div>
        </header>

        <section class="card">
          <h2>STORY STATEMENT</h2>
          <div class="statement-grid">
            <label for="asA">As a</label>
            <input id="asA" type="text" />
            <label for="iWantTo">I want to</label>
            <textarea id="iWantTo" rows="2"></textarea>
            <label for="soThat">So that</label>
            <textarea id="soThat" rows="2"></textarea>
          </div>
        </section>

        <section class="card">
          <div class="section-header">
            <h2>BUSINESS RULES</h2>
            <button id="addBusinessRule" type="button" class="ghost-button">+ Add Rule</button>
          </div>
          <ul id="businessRules" class="criteria-list"></ul>
        </section>

        <section class="card">
          <div class="section-header">
            <h2>ACCEPTANCE CRITERIA (GHERKIN FORMAT)</h2>
            <button id="addAcceptance" type="button" class="ghost-button">+ Add Criteria</button>
          </div>
          <ol id="acceptanceCriteria" class="criteria-list ordered"></ol>
        </section>
      </main>

      <aside class="right-panel">
        <div class="panel-title">PROPERTIES</div>
        <div class="field">
          <label for="itemType">Item Type</label>
          <input id="itemType" type="text" value="User Story" readonly />
        </div>
        <div class="field">
          <label for="status">Status</label>
          <select id="status">
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>
        <div class="field">
          <label for="priority">Priority</label>
          <select id="priority">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div class="field">
          <label for="storyPoints">Story Points</label>
          <input id="storyPoints" type="number" min="0" step="1" />
        </div>
        <div class="field">
          <label for="devNotes">Dev Notes / Extras</label>
          <textarea id="devNotes" rows="7"></textarea>
        </div>
      </aside>
    </div>

    <script nonce="${input.nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

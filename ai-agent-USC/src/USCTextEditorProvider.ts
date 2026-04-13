import * as vscode from "vscode";

export class USCTextEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken,
  ): Promise<void> {
    webviewPanel.webview.options = {
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
      ],
    };

    webviewPanel.webview.html = this.getHtml(webviewPanel.webview);
  }

  private getHtml(webview: vscode.Webview): string {
    const css = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "usc.css"),
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="${css}"> 

        <title>User Story</title>
      </head>
      <body>
        <div>
          <h1 class="title">Teste</h1>
          <section class="story-statement-section">
            <h2 class="subtitle">🗩  story statement</h2>
            <div class="story-statement-form-group">
              <label>As a</label>
              <input></input>
              <label>I want to</label>
              <input></input>
              <label>So that</label>
              <input></input>
            </div>
          </section>

          <section>
            <div class="criteria-div">  
              <h2 class="subtitle">🗹  acceptance criteria (gherkin format)</h2>
              <div class="criteria-buttons">
                <button>Generate AI Criteria</button>
                <button>+Add Criteria</button>
              </div>
            </div>
            <ol class="criteria-ol">
                <li>
                  <textarea></textarea>
                </li>
            </ol>
          </section>

          <section>
            <div class="criteria-div">  
              <h2 class="subtitle"><> technical criteria</h2>
              <div class="criteria-buttons">
                <button>Generate AI Criteria</button>
                <button>+Add Criteria</button>
              </div>
            </div>
            <ul class="criteria-ul">
                <li>
                  <input></input>
                </li>
            </ul>
          </section>
        </div>
      </body>
      </html>
    `;
  }
}

import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { pull } from './commands/pull';
import { push } from './commands/push';
import { listWorkbooks } from './commands/list';
import { createStatusBar, updateStatusBar } from './statusBar';
import { saveConfig } from './config';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext): void {
  // Start the Language Server
  const serverModule = path.join(__dirname, '..', '..', 'lsp', 'out', 'server.js');
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'vba' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{bas,cls,frm}'),
    },
  };

  client = new LanguageClient('vba', 'VBA Language Server', serverOptions, clientOptions);
  client.start();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('vba.pull', async () => {
      await pull();
      updateStatusBar();
    }),
    vscode.commands.registerCommand('vba.push', async () => {
      await push();
    }),
    vscode.commands.registerCommand('vba.list', async () => {
      const workbook = await listWorkbooks();
      if (workbook) {
        saveConfig({ workbook: workbook.path, moduleDir: './src' });
        updateStatusBar();
        vscode.window.showInformationMessage(`Linked to ${workbook.name}`);
      }
    }),
  );

  // Status bar
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  // Watch for config file changes
  const configWatcher = vscode.workspace.createFileSystemWatcher('**/.vbaproj.json');
  configWatcher.onDidChange(() => updateStatusBar());
  configWatcher.onDidCreate(() => updateStatusBar());
  configWatcher.onDidDelete(() => updateStatusBar());
  context.subscriptions.push(configWatcher);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}

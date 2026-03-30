import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { callBridge } from '../bridge/client';
import { PushResponse } from '../bridge/types';
import { loadConfig } from '../config';

export async function push(): Promise<void> {
  try {
    const config = loadConfig();
    if (!config) {
      vscode.window.showErrorMessage(
        'No workbook linked. Run "VBA: Pull from Excel" first to link a workbook.'
      );
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const moduleDir = path.resolve(workspaceFolders[0].uri.fsPath, config.moduleDir);

    // Gather all .bas/.cls/.frm files
    const modules: string[] = [];
    if (fs.existsSync(moduleDir)) {
      const files = fs.readdirSync(moduleDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.bas' || ext === '.cls' || ext === '.frm') {
          modules.push(path.join(moduleDir, file));
        }
      }
    }

    if (modules.length === 0) {
      vscode.window.showWarningMessage(`No VBA files found in ${config.moduleDir}`);
      return;
    }

    // Push
    const response = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'VBA: Pushing to Excel...',
        cancellable: false,
      },
      async () => {
        return callBridge<PushResponse>({
          command: 'push',
          workbook: config.workbook,
          modules,
        });
      }
    );

    if (!response.ok) {
      vscode.window.showErrorMessage(`Push failed: ${response.error}`);
      return;
    }

    vscode.window.showInformationMessage(
      `Pushed ${response.pushed} module${response.pushed !== 1 ? 's' : ''} to ${path.basename(config.workbook)}`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Push error: ${err.message}`);
  }
}

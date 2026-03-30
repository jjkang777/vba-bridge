import * as vscode from 'vscode';
import * as path from 'path';
import { callBridge } from '../bridge/client';
import { PullResponse } from '../bridge/types';
import { loadConfig, saveConfig } from '../config';
import { listWorkbooks } from './list';

export async function pull(): Promise<void> {
  try {
    // Get workbook — from config or by asking
    let config = loadConfig();
    let workbookPath: string;

    if (config) {
      workbookPath = config.workbook;
    } else {
      const selected = await listWorkbooks();
      if (!selected) return;
      workbookPath = selected.path;
    }

    // Determine output directory
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
      return;
    }

    const moduleDir = config?.moduleDir || './src';
    const outDir = path.resolve(workspaceFolders[0].uri.fsPath, moduleDir);

    // Pull
    const response = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'VBA: Pulling from Excel...',
        cancellable: false,
      },
      async () => {
        return callBridge<PullResponse>({
          command: 'pull',
          workbook: workbookPath,
          outDir,
        });
      }
    );

    if (!response.ok) {
      vscode.window.showErrorMessage(`Pull failed: ${response.error}`);
      return;
    }

    // Save/update config
    saveConfig({ workbook: workbookPath, moduleDir });

    const count = response.modules?.length || 0;
    vscode.window.showInformationMessage(
      `Pulled ${count} module${count !== 1 ? 's' : ''} from ${path.basename(workbookPath)}`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Pull error: ${err.message}`);
  }
}

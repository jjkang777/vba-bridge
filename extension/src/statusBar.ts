import * as vscode from 'vscode';
import * as path from 'path';
import { loadConfig } from './config';

let statusBarItem: vscode.StatusBarItem;

export function createStatusBar(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'vba.list';
  updateStatusBar();
  statusBarItem.show();
  return statusBarItem;
}

export function updateStatusBar(): void {
  if (!statusBarItem) return;

  const config = loadConfig();
  if (config) {
    const name = path.basename(config.workbook);
    statusBarItem.text = `$(file-code) VBA: ${name}`;
    statusBarItem.tooltip = `Linked to ${config.workbook}\nClick to switch workbook`;
  } else {
    statusBarItem.text = '$(file-code) VBA: No workbook linked';
    statusBarItem.tooltip = 'Click to link a workbook';
  }
}

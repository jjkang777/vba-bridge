import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface VbaProjectConfig {
  workbook: string;
  moduleDir: string;
}

const CONFIG_FILENAME = '.vbaproj.json';

export function getConfigPath(): string | null {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) return null;
  return path.join(workspaceFolders[0].uri.fsPath, CONFIG_FILENAME);
}

export function loadConfig(): VbaProjectConfig | null {
  const configPath = getConfigPath();
  if (!configPath) return null;

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content) as VbaProjectConfig;
    }
  } catch {
    // Ignore invalid config
  }
  return null;
}

export function saveConfig(config: VbaProjectConfig): void {
  const configPath = getConfigPath();
  if (!configPath) {
    vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
    return;
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

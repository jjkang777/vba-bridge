import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { BridgeRequest, BridgeResponse } from './types';

export async function callBridge<T extends BridgeResponse>(
  request: BridgeRequest,
): Promise<T> {
  const bridgePath = getBridgePath();

  return new Promise((resolve, reject) => {
    const proc = spawn(bridgePath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('error', (err: Error) => {
      reject(new Error(`Failed to start bridge: ${err.message}. Is vba-bridge.exe available?`));
    });

    proc.on('close', (code: number | null) => {
      if (stdout) {
        try {
          const response = JSON.parse(stdout) as T;
          resolve(response);
        } catch {
          reject(new Error(`Invalid bridge response: ${stdout}`));
        }
      } else {
        reject(new Error(`Bridge exited with code ${code}: ${stderr}`));
      }
    });

    // Send request and close stdin
    const input = JSON.stringify(request);
    proc.stdin.write(input);
    proc.stdin.end();

    // Timeout after 30 seconds
    setTimeout(() => {
      proc.kill();
      reject(new Error('Bridge timed out after 30 seconds'));
    }, 30000);
  });
}

function getBridgePath(): string {
  const config = vscode.workspace.getConfiguration('vba');
  const customPath = config.get<string>('bridge.path');
  if (customPath) return customPath;

  // Default: bundled bridge next to extension
  return path.join(__dirname, '..', '..', 'bridge', 'bin', 'Release', 'vba-bridge.exe');
}

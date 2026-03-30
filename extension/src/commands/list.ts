import * as vscode from 'vscode';
import { callBridge } from '../bridge/client';
import { ListResponse, WorkbookInfo } from '../bridge/types';

export async function listWorkbooks(): Promise<WorkbookInfo | undefined> {
  const response = await callBridge<ListResponse>({ command: 'list' });

  if (!response.ok) {
    handleBridgeError(response.error, response.code);
    return undefined;
  }

  if (response.workbooks.length === 0) {
    vscode.window.showInformationMessage('No open workbooks found in Excel.');
    return undefined;
  }

  const items = response.workbooks.map(wb => ({
    label: wb.name,
    description: wb.path,
    workbook: wb,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a workbook',
  });

  return selected?.workbook;
}

function handleBridgeError(error?: string, code?: string): void {
  switch (code) {
    case 'EXCEL_NOT_FOUND':
      vscode.window.showErrorMessage(
        'Excel is not running. Please open your workbook in Excel first.'
      );
      break;
    case 'TRUST_ACCESS_DISABLED':
      vscode.window.showErrorMessage(
        'VBA project access is disabled. Enable "Trust access to the VBA project object model" in Excel Trust Center.',
        'Show me how'
      ).then(selection => {
        if (selection === 'Show me how') {
          vscode.env.openExternal(vscode.Uri.parse(
            'https://support.microsoft.com/en-us/office/enable-or-disable-macros-in-microsoft-365-files-12b036fd-d140-4e74-b45e-16fed1a7e5c6'
          ));
        }
      });
      break;
    default:
      vscode.window.showErrorMessage(`VBA Bridge error: ${error || 'Unknown error'}`);
  }
}

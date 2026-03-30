import { Location, TextDocumentPositionParams } from 'vscode-languageserver';
import { WorkspaceIndex } from '../workspace';

export function getDefinition(
  params: TextDocumentPositionParams,
  workspace: WorkspaceIndex,
  documentText: string,
): Location | null {
  const line = documentText.split('\n')[params.position.line] || '';
  const word = getWordAtPosition(line, params.position.character);
  if (!word) return null;

  const sym = workspace.getSymbol(word);
  if (sym) {
    return {
      uri: sym.uri,
      range: sym.range,
    };
  }

  return null;
}

function getWordAtPosition(line: string, character: number): string | null {
  let start = character;
  let end = character;
  while (start > 0 && /[A-Za-z0-9_]/.test(line[start - 1])) start--;
  while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end++;
  const word = line.substring(start, end);
  return word.length > 0 ? word : null;
}

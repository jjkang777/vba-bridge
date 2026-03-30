import { Location, ReferenceParams } from 'vscode-languageserver';
import { WorkspaceIndex } from '../workspace';

export function getReferences(
  params: ReferenceParams,
  workspace: WorkspaceIndex,
  documentText: string,
): Location[] {
  const line = documentText.split('\n')[params.position.line] || '';
  const word = getWordAtPosition(line, params.position.character);
  if (!word) return [];

  const locations: Location[] = [];
  const lowerWord = word.toLowerCase();

  // Search all documents for references to this symbol
  for (const uri of workspace.getAllDocumentUris()) {
    const text = workspace.getText(uri);
    if (!text) continue;

    const lines = text.split('\n');
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const lineText = lines[lineNum];
      // Find all occurrences of the word as a whole word (case-insensitive)
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(lineText)) !== null) {
        locations.push({
          uri,
          range: {
            start: { line: lineNum, character: match.index },
            end: { line: lineNum, character: match.index + match[0].length },
          },
        });
      }
    }
  }

  return locations;
}

function getWordAtPosition(line: string, character: number): string | null {
  let start = character;
  let end = character;
  while (start > 0 && /[A-Za-z0-9_]/.test(line[start - 1])) start--;
  while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end++;
  const word = line.substring(start, end);
  return word.length > 0 ? word : null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

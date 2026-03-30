import { Hover, TextDocumentPositionParams } from 'vscode-languageserver';
import { WorkspaceIndex } from '../workspace';
import { getStubClass, getStubMember, getGlobalFunction } from '../stubs';

export function getHover(
  params: TextDocumentPositionParams,
  workspace: WorkspaceIndex,
  documentText: string,
): Hover | null {
  const line = documentText.split('\n')[params.position.line] || '';
  const word = getWordAtPosition(line, params.position.character);
  if (!word) return null;

  // Check for member access: object.member
  const dotContext = getDotContext(line, params.position.character);
  if (dotContext) {
    // Try Excel object model
    const member = getStubMember(dotContext.object, dotContext.member);
    if (member) {
      const paramStr = member.parameters
        ? member.parameters.map(p => `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`).join(', ')
        : '';
      const sig = member.kind === 'method'
        ? `(method) ${dotContext.object}.${member.name}(${paramStr}) As ${member.returnType}`
        : `(property) ${dotContext.object}.${member.name} As ${member.returnType}`;
      return {
        contents: {
          kind: 'markdown',
          value: `\`\`\`vba\n${sig}\n\`\`\`\n${member.description}`,
        },
      };
    }
    return null;
  }

  // Check user-defined symbols
  const sym = workspace.getSymbol(word);
  if (sym) {
    const content = sym.detail
      ? `\`\`\`vba\n${sym.detail}\n\`\`\``
      : `(${sym.kind}) ${sym.name}`;
    return { contents: { kind: 'markdown', value: content } };
  }

  // Check global VBA functions
  const globalFn = getGlobalFunction(word);
  if (globalFn) {
    const paramStr = globalFn.parameters
      ? globalFn.parameters.map(p => `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`).join(', ')
      : '';
    return {
      contents: {
        kind: 'markdown',
        value: `\`\`\`vba\nFunction ${globalFn.name}(${paramStr}) As ${globalFn.returnType}\n\`\`\`\n${globalFn.description}`,
      },
    };
  }

  // Check Excel class names
  const cls = getStubClass(word);
  if (cls) {
    return {
      contents: {
        kind: 'markdown',
        value: `\`\`\`vba\n(class) ${cls.name}\n\`\`\`\n${cls.description}`,
      },
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

function getDotContext(line: string, character: number): { object: string; member: string } | null {
  // Find the word at cursor position
  let end = character;
  while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end++;
  let start = character;
  while (start > 0 && /[A-Za-z0-9_]/.test(line[start - 1])) start--;
  const member = line.substring(start, end);

  // Check for dot before the word
  let dotPos = start - 1;
  while (dotPos >= 0 && line[dotPos] === ' ') dotPos--;
  if (dotPos < 0 || line[dotPos] !== '.') return null;

  // Get the object name before the dot
  let objEnd = dotPos;
  let objStart = objEnd;
  while (objStart > 0 && /[A-Za-z0-9_]/.test(line[objStart - 1])) objStart--;
  const object = line.substring(objStart, objEnd);

  if (object && member) return { object, member };
  return null;
}

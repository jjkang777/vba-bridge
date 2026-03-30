import { CompletionItem, CompletionItemKind, TextDocumentPositionParams } from 'vscode-languageserver';
import { WorkspaceIndex } from '../workspace';
import { getStubClass, getAllStubClasses, getGlobalFunction, getAllGlobalFunctions } from '../stubs';

const VBA_KEYWORDS = [
  'Sub', 'Function', 'Property', 'End Sub', 'End Function', 'End Property',
  'If', 'Then', 'Else', 'ElseIf', 'End If',
  'For', 'To', 'Step', 'Next', 'Each', 'In',
  'Do', 'Loop', 'While', 'Wend', 'Until',
  'With', 'End With', 'Select Case', 'Case', 'End Select',
  'Dim', 'ReDim', 'Preserve', 'Public', 'Private', 'Static', 'Const',
  'Set', 'Let', 'Call', 'GoTo', 'GoSub', 'Return',
  'On Error GoTo', 'On Error Resume Next', 'On Error GoTo 0',
  'Exit Sub', 'Exit Function', 'Exit For', 'Exit Do', 'Exit Property',
  'Option Explicit', 'Option Compare', 'Option Base',
  'ByVal', 'ByRef', 'Optional', 'ParamArray', 'As', 'New',
  'True', 'False', 'Nothing', 'Empty', 'Null', 'Me',
  'And', 'Or', 'Not', 'Xor', 'Mod', 'Is', 'Like',
  'Type', 'End Type', 'Enum', 'End Enum',
  'Debug.Print',
];

export function getCompletions(
  params: TextDocumentPositionParams,
  workspace: WorkspaceIndex,
  documentText: string,
): CompletionItem[] {
  const items: CompletionItem[] = [];
  const line = documentText.split('\n')[params.position.line] || '';
  const textBeforeCursor = line.substring(0, params.position.character);

  // Check if we're after a dot — member completion
  const dotMatch = textBeforeCursor.match(/(\w+)\.\s*(\w*)$/);
  if (dotMatch) {
    const objectName = dotMatch[1];
    return getMemberCompletions(objectName, workspace);
  }

  // Keyword completions
  for (const kw of VBA_KEYWORDS) {
    items.push({
      label: kw,
      kind: CompletionItemKind.Keyword,
      detail: 'VBA Keyword',
    });
  }

  // Global VBA functions
  for (const fn of getAllGlobalFunctions()) {
    const paramStr = fn.parameters
      ? fn.parameters.map(p => `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`).join(', ')
      : '';
    items.push({
      label: fn.name,
      kind: CompletionItemKind.Function,
      detail: `${fn.name}(${paramStr}) As ${fn.returnType}`,
      documentation: fn.description,
    });
  }

  // Excel object model classes (for 'Dim x As ...' completions)
  for (const cls of getAllStubClasses()) {
    items.push({
      label: cls.name,
      kind: CompletionItemKind.Class,
      detail: cls.description,
    });
  }

  // User-defined symbols from workspace
  for (const sym of workspace.getAllSymbols()) {
    let kind: CompletionItemKind;
    switch (sym.kind) {
      case 'sub': kind = CompletionItemKind.Method; break;
      case 'function': kind = CompletionItemKind.Function; break;
      case 'property': kind = CompletionItemKind.Property; break;
      case 'variable': kind = CompletionItemKind.Variable; break;
      case 'const': kind = CompletionItemKind.Constant; break;
      case 'type': kind = CompletionItemKind.Struct; break;
      case 'enum': kind = CompletionItemKind.Enum; break;
      case 'enumMember': kind = CompletionItemKind.EnumMember; break;
      default: kind = CompletionItemKind.Text;
    }
    items.push({
      label: sym.name,
      kind,
      detail: sym.detail || sym.kind,
    });
  }

  return items;
}

function getMemberCompletions(objectName: string, workspace: WorkspaceIndex): CompletionItem[] {
  const items: CompletionItem[] = [];

  // Check Excel object model
  const cls = getStubClass(objectName);
  if (cls) {
    for (const member of cls.members) {
      const kind = member.kind === 'property' ? CompletionItemKind.Property
        : member.kind === 'method' ? CompletionItemKind.Method
        : CompletionItemKind.Event;
      const paramStr = member.parameters
        ? member.parameters.map(p => `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`).join(', ')
        : '';
      items.push({
        label: member.name,
        kind,
        detail: member.kind === 'method' ? `${member.name}(${paramStr}) As ${member.returnType}` : `${member.name} As ${member.returnType}`,
        documentation: member.description,
      });
    }
  }

  // Check if objectName matches a variable type in workspace
  for (const sym of workspace.getAllSymbols()) {
    if (sym.kind === 'variable' && sym.name.toLowerCase() === objectName.toLowerCase() && sym.detail) {
      const varType = getStubClass(sym.detail);
      if (varType) {
        for (const member of varType.members) {
          if (!items.find(i => i.label === member.name)) {
            items.push({
              label: member.name,
              kind: member.kind === 'property' ? CompletionItemKind.Property : CompletionItemKind.Method,
              detail: `${member.name} As ${member.returnType}`,
              documentation: member.description,
            });
          }
        }
      }
    }
  }

  return items;
}

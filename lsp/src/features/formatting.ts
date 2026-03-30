import { TextEdit, DocumentFormattingParams } from 'vscode-languageserver';

interface FormattingOptions {
  indentSize: number;
  keywordCase: 'PascalCase' | 'lowercase' | 'UPPERCASE' | 'preserve';
}

const INDENT_INCREASE = new Set([
  'sub', 'function', 'property', 'if', 'else', 'elseif',
  'for', 'do', 'while', 'with', 'select', 'case', 'type', 'enum',
]);

const INDENT_DECREASE = new Set([
  'end', 'else', 'elseif', 'next', 'loop', 'wend', 'case',
]);

const KEYWORD_PASCAL: Record<string, string> = {
  'sub': 'Sub', 'function': 'Function', 'property': 'Property',
  'end': 'End', 'if': 'If', 'then': 'Then', 'else': 'Else', 'elseif': 'ElseIf',
  'for': 'For', 'to': 'To', 'step': 'Step', 'next': 'Next', 'each': 'Each', 'in': 'In',
  'do': 'Do', 'loop': 'Loop', 'while': 'While', 'wend': 'Wend', 'until': 'Until',
  'with': 'With', 'select': 'Select', 'case': 'Case',
  'dim': 'Dim', 'redim': 'ReDim', 'public': 'Public', 'private': 'Private',
  'static': 'Static', 'const': 'Const', 'global': 'Global', 'friend': 'Friend',
  'set': 'Set', 'let': 'Let', 'call': 'Call', 'new': 'New',
  'as': 'As', 'byval': 'ByVal', 'byref': 'ByRef', 'optional': 'Optional',
  'paramarray': 'ParamArray', 'on': 'On', 'error': 'Error', 'resume': 'Resume',
  'goto': 'GoTo', 'gosub': 'GoSub', 'return': 'Return', 'exit': 'Exit',
  'get': 'Get', 'me': 'Me', 'nothing': 'Nothing', 'is': 'Is', 'like': 'Like',
  'and': 'And', 'or': 'Or', 'not': 'Not', 'xor': 'Xor', 'mod': 'Mod',
  'true': 'True', 'false': 'False', 'empty': 'Empty', 'null': 'Null',
  'option': 'Option', 'explicit': 'Explicit', 'compare': 'Compare', 'base': 'Base',
  'type': 'Type', 'enum': 'Enum', 'preserve': 'Preserve', 'implements': 'Implements',
  'boolean': 'Boolean', 'byte': 'Byte', 'integer': 'Integer', 'long': 'Long',
  'single': 'Single', 'double': 'Double', 'currency': 'Currency', 'date': 'Date',
  'string': 'String', 'variant': 'Variant', 'object': 'Object', 'any': 'Any',
  'debug': 'Debug', 'print': 'Print', 'attribute': 'Attribute',
  'declare': 'Declare', 'lib': 'Lib', 'alias': 'Alias',
  'eqv': 'Eqv', 'imp': 'Imp',
};

export function formatDocument(
  text: string,
  options: FormattingOptions,
): TextEdit[] {
  const lines = text.split('\n');
  const edits: TextEdit[] = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith("'")) continue;

    // Get the first keyword for indent logic
    const firstWord = trimmed.split(/[\s(]/)[0].toLowerCase();

    // Decrease indent before the line
    if (shouldDecreaseIndent(trimmed, firstWord)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Build the new line
    let newLine = ' '.repeat(indentLevel * options.indentSize) + trimmed;

    // Apply keyword casing
    if (options.keywordCase !== 'preserve') {
      newLine = applyKeywordCase(newLine, options.keywordCase);
    }

    if (newLine !== line) {
      edits.push({
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        newText: newLine,
      });
    }

    // Increase indent after the line
    if (shouldIncreaseIndent(trimmed, firstWord)) {
      indentLevel++;
    }
  }

  return edits;
}

function shouldDecreaseIndent(trimmed: string, firstWord: string): boolean {
  if (firstWord === 'end' || firstWord === 'next' || firstWord === 'loop' || firstWord === 'wend') return true;
  if (firstWord === 'else' || firstWord === 'elseif') return true;
  if (firstWord === 'case') return true;
  return false;
}

function shouldIncreaseIndent(trimmed: string, firstWord: string): boolean {
  const lower = trimmed.toLowerCase();
  // Sub/Function/Property declarations (not End)
  if (/^(public\s+|private\s+|friend\s+)?(static\s+)?(sub|function|property)\s+/i.test(lower)) return true;
  // If ... Then (multi-line only — no statement after Then on same line)
  if (/^(if|elseif)\b.*\bthen\s*$/i.test(lower)) return true;
  if (firstWord === 'else' && !lower.includes('if')) return true;
  if (firstWord === 'for') return true;
  if (firstWord === 'do') return true;
  if (firstWord === 'while' && !lower.startsWith('wend')) return true;
  if (/^with\s+/i.test(lower)) return true;
  if (/^select\s+case/i.test(lower)) return true;
  if (firstWord === 'case' && !/^case\s+else/i.test(lower)) return true;
  if (/^(public\s+|private\s+)?type\s+/i.test(lower)) return true;
  if (/^(public\s+|private\s+)?enum\s+/i.test(lower)) return true;
  return false;
}

function applyKeywordCase(line: string, caseStyle: 'PascalCase' | 'lowercase' | 'UPPERCASE'): string {
  return line.replace(/\b([A-Za-z_]\w*)\b/g, (match) => {
    const lower = match.toLowerCase();
    if (KEYWORD_PASCAL[lower]) {
      switch (caseStyle) {
        case 'PascalCase': return KEYWORD_PASCAL[lower];
        case 'lowercase': return lower;
        case 'UPPERCASE': return match.toUpperCase();
      }
    }
    return match;
  });
}

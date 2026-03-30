import { Position, Range } from './types';

export enum TokenType {
  Keyword,
  Identifier,
  StringLiteral,
  NumberLiteral,
  Operator,
  Dot,
  Comma,
  Colon,
  Semicolon,
  LeftParen,
  RightParen,
  LeftBracket,
  RightBracket,
  Comment,
  Newline,
  LineContinuation,
  Hash,
  EOF,
}

export interface Token {
  type: TokenType;
  value: string;
  range: Range;
}

const KEYWORDS = new Set([
  'sub', 'function', 'property', 'end', 'if', 'then', 'else', 'elseif',
  'for', 'next', 'each', 'in', 'do', 'loop', 'while', 'wend', 'until',
  'with', 'select', 'case', 'goto', 'gosub', 'return', 'exit',
  'on', 'error', 'resume', 'set', 'let', 'dim', 'redim',
  'public', 'private', 'friend', 'static', 'const', 'global',
  'byval', 'byref', 'optional', 'paramarray', 'as', 'new', 'me',
  'nothing', 'is', 'like', 'and', 'or', 'not', 'xor', 'eqv', 'imp', 'mod',
  'to', 'step', 'call', 'implements', 'option', 'explicit', 'compare', 'base',
  'type', 'enum', 'declare', 'lib', 'alias', 'get', 'attribute',
  'true', 'false', 'empty', 'null', 'debug', 'print', 'preserve',
  'boolean', 'byte', 'integer', 'long', 'longptr', 'longlong',
  'single', 'double', 'currency', 'decimal', 'date', 'string',
  'variant', 'object', 'any', 'rem', 'ptrsafe',
  'event', 'raiseevent', 'withevents',
]);

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let line = 0;
  let character = 0;
  let i = 0;

  function pos(): Position {
    return { line, character };
  }

  function makeRange(start: Position, end: Position): Range {
    return { start, end };
  }

  while (i < text.length) {
    const ch = text[i];

    // Newline
    if (ch === '\r' || ch === '\n') {
      const start = pos();
      if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i += 2;
      } else {
        i++;
      }
      tokens.push({ type: TokenType.Newline, value: '\n', range: makeRange(start, pos()) });
      line++;
      character = 0;
      continue;
    }

    // Whitespace (skip)
    if (ch === ' ' || ch === '\t') {
      i++;
      character++;
      continue;
    }

    // Line continuation: _ at end of line (preceded by space)
    if (ch === '_' && i > 0 && (text[i - 1] === ' ' || text[i - 1] === '\t')) {
      const rest = text.substring(i + 1);
      const nlMatch = rest.match(/^[ \t]*(\r\n|\r|\n)/);
      if (nlMatch) {
        // Skip the _ and the newline
        i += 1 + nlMatch[0].length;
        line++;
        character = 0;
        continue;
      }
    }

    // Comment: ' or Rem
    if (ch === "'") {
      const start = pos();
      let value = '';
      while (i < text.length && text[i] !== '\r' && text[i] !== '\n') {
        value += text[i];
        i++;
        character++;
      }
      tokens.push({ type: TokenType.Comment, value, range: makeRange(start, pos()) });
      continue;
    }

    // String literal
    if (ch === '"') {
      const start = pos();
      let value = '"';
      i++;
      character++;
      while (i < text.length) {
        if (text[i] === '"') {
          value += '"';
          i++;
          character++;
          if (i < text.length && text[i] === '"') {
            value += '"';
            i++;
            character++;
          } else {
            break;
          }
        } else if (text[i] === '\r' || text[i] === '\n') {
          break; // Unterminated string
        } else {
          value += text[i];
          i++;
          character++;
        }
      }
      tokens.push({ type: TokenType.StringLiteral, value, range: makeRange(start, pos()) });
      continue;
    }

    // Numbers: hex, octal, decimal
    if (ch === '&' && i + 1 < text.length && (text[i + 1] === 'H' || text[i + 1] === 'h')) {
      const start = pos();
      let value = '&H';
      i += 2;
      character += 2;
      while (i < text.length && /[0-9A-Fa-f]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      if (i < text.length && /[&%^]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      tokens.push({ type: TokenType.NumberLiteral, value, range: makeRange(start, pos()) });
      continue;
    }

    if (ch === '&' && i + 1 < text.length && (text[i + 1] === 'O' || text[i + 1] === 'o')) {
      const start = pos();
      let value = '&O';
      i += 2;
      character += 2;
      while (i < text.length && /[0-7]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      if (i < text.length && /[&%^]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      tokens.push({ type: TokenType.NumberLiteral, value, range: makeRange(start, pos()) });
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const start = pos();
      let value = '';
      while (i < text.length && /[0-9]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      if (i < text.length && text[i] === '.') {
        value += '.';
        i++;
        character++;
        while (i < text.length && /[0-9]/.test(text[i])) {
          value += text[i];
          i++;
          character++;
        }
      }
      if (i < text.length && /[eEdD]/i.test(text[i])) {
        value += text[i];
        i++;
        character++;
        if (i < text.length && /[+-]/.test(text[i])) {
          value += text[i];
          i++;
          character++;
        }
        while (i < text.length && /[0-9]/.test(text[i])) {
          value += text[i];
          i++;
          character++;
        }
      }
      if (i < text.length && /[%&!#@$^]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      tokens.push({ type: TokenType.NumberLiteral, value, range: makeRange(start, pos()) });
      continue;
    }

    // Identifiers and keywords
    if (/[A-Za-z_]/.test(ch)) {
      const start = pos();
      let value = '';
      while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) {
        value += text[i];
        i++;
        character++;
      }
      // Check for Rem comment
      if (value.toLowerCase() === 'rem' && (i >= text.length || text[i] === ' ' || text[i] === '\t' || text[i] === '\r' || text[i] === '\n')) {
        let comment = value;
        while (i < text.length && text[i] !== '\r' && text[i] !== '\n') {
          comment += text[i];
          i++;
          character++;
        }
        tokens.push({ type: TokenType.Comment, value: comment, range: makeRange(start, pos()) });
        continue;
      }
      const tokenType = KEYWORDS.has(value.toLowerCase()) ? TokenType.Keyword : TokenType.Identifier;
      tokens.push({ type: tokenType, value, range: makeRange(start, pos()) });
      continue;
    }

    // Punctuation and operators
    const start = pos();
    switch (ch) {
      case '.':
        tokens.push({ type: TokenType.Dot, value: '.', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case ',':
        tokens.push({ type: TokenType.Comma, value: ',', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case ':':
        if (i + 1 < text.length && text[i + 1] === '=') {
          tokens.push({ type: TokenType.Operator, value: ':=', range: makeRange(start, { line, character: character + 2 }) });
          i += 2; character += 2;
        } else {
          tokens.push({ type: TokenType.Colon, value: ':', range: makeRange(start, { line, character: character + 1 }) });
          i++; character++;
        }
        break;
      case ';':
        tokens.push({ type: TokenType.Semicolon, value: ';', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case '(':
        tokens.push({ type: TokenType.LeftParen, value: '(', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case ')':
        tokens.push({ type: TokenType.RightParen, value: ')', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case '[':
        // Bracketed identifiers like [Sheet Name]
        if (true) {
          let value = '[';
          i++; character++;
          while (i < text.length && text[i] !== ']' && text[i] !== '\r' && text[i] !== '\n') {
            value += text[i];
            i++; character++;
          }
          if (i < text.length && text[i] === ']') {
            value += ']';
            i++; character++;
          }
          tokens.push({ type: TokenType.Identifier, value, range: makeRange(start, pos()) });
        }
        break;
      case '#':
        tokens.push({ type: TokenType.Hash, value: '#', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case '<':
        if (i + 1 < text.length && text[i + 1] === '>') {
          tokens.push({ type: TokenType.Operator, value: '<>', range: makeRange(start, { line, character: character + 2 }) });
          i += 2; character += 2;
        } else if (i + 1 < text.length && text[i + 1] === '=') {
          tokens.push({ type: TokenType.Operator, value: '<=', range: makeRange(start, { line, character: character + 2 }) });
          i += 2; character += 2;
        } else {
          tokens.push({ type: TokenType.Operator, value: '<', range: makeRange(start, { line, character: character + 1 }) });
          i++; character++;
        }
        break;
      case '>':
        if (i + 1 < text.length && text[i + 1] === '=') {
          tokens.push({ type: TokenType.Operator, value: '>=', range: makeRange(start, { line, character: character + 2 }) });
          i += 2; character += 2;
        } else {
          tokens.push({ type: TokenType.Operator, value: '>', range: makeRange(start, { line, character: character + 1 }) });
          i++; character++;
        }
        break;
      case '=':
        tokens.push({ type: TokenType.Operator, value: '=', range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      case '+': case '-': case '*': case '/': case '\\': case '^': case '&':
        tokens.push({ type: TokenType.Operator, value: ch, range: makeRange(start, { line, character: character + 1 }) });
        i++; character++;
        break;
      default:
        // Skip unknown characters
        i++; character++;
        break;
    }
  }

  tokens.push({ type: TokenType.EOF, value: '', range: makeRange(pos(), pos()) });
  return tokens;
}

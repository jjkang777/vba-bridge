import { tokenize, Token, TokenType } from './lexer';
import {
  Module, OptionStatement, Procedure, Declaration,
  SubDeclaration, FunctionDeclaration, PropertyDeclaration,
  Parameter, VariableDeclaration, VariableItem, ConstDeclaration,
  TypeDeclaration, TypeMember, EnumDeclaration, EnumMember,
  Statement, ParseDiagnostic, ParseResult, Range, Position,
} from './types';

class Parser {
  private tokens: Token[] = [];
  private pos = 0;
  private diagnostics: ParseDiagnostic[] = [];

  parse(text: string): ParseResult {
    this.tokens = tokenize(text);
    this.pos = 0;
    this.diagnostics = [];
    const module = this.parseModule();
    return { module, diagnostics: this.diagnostics };
  }

  private current(): Token {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];
  }

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    const tok = this.current();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return tok;
  }

  private isEOF(): boolean {
    return this.current().type === TokenType.EOF;
  }

  private matchKeyword(...keywords: string[]): boolean {
    const tok = this.current();
    return tok.type === TokenType.Keyword && keywords.includes(tok.value.toLowerCase());
  }

  private expectKeyword(keyword: string): Token {
    const tok = this.current();
    if (tok.type === TokenType.Keyword && tok.value.toLowerCase() === keyword.toLowerCase()) {
      return this.advance();
    }
    this.error(`Expected '${keyword}', got '${tok.value}'`);
    return tok;
  }

  private expectType(type: TokenType): Token {
    const tok = this.current();
    if (tok.type === type) {
      return this.advance();
    }
    this.error(`Expected ${TokenType[type]}, got '${tok.value}'`);
    return tok;
  }

  private error(message: string): void {
    const tok = this.current();
    this.diagnostics.push({
      message,
      range: tok.range,
      severity: 'error',
    });
  }

  private skipNewlines(): void {
    while (this.current().type === TokenType.Newline || this.current().type === TokenType.Comment) {
      this.advance();
    }
  }

  private skipToNextLine(): void {
    while (!this.isEOF() && this.current().type !== TokenType.Newline) {
      this.advance();
    }
    if (this.current().type === TokenType.Newline) {
      this.advance();
    }
  }

  private collectToEndOfLine(): string {
    let text = '';
    while (!this.isEOF() && this.current().type !== TokenType.Newline) {
      if (text) text += ' ';
      text += this.current().value;
      this.advance();
    }
    return text;
  }

  // ---- Module ----

  private parseModule(): Module {
    const start = this.current().range.start;
    const options: OptionStatement[] = [];
    const declarations: Declaration[] = [];
    const procedures: Procedure[] = [];

    this.skipNewlines();

    while (!this.isEOF()) {
      this.skipNewlines();
      if (this.isEOF()) break;

      try {
        if (this.matchKeyword('option')) {
          options.push(this.parseOptionStatement());
        } else if (this.matchKeyword('attribute')) {
          this.skipToNextLine(); // Skip Attribute lines
        } else if (this.isStartOfProcedure()) {
          procedures.push(this.parseProcedure());
        } else if (this.matchKeyword('dim', 'public', 'private', 'global', 'static')) {
          const vis = this.current().value.toLowerCase();
          // Check if next meaningful token is Sub/Function/Property/Const/Enum/Type/Declare
          if (this.matchKeyword('public', 'private', 'friend', 'global')) {
            const next = this.peekNonNewline(1);
            if (next && ['sub', 'function', 'property', 'static', 'declare'].includes(next.value.toLowerCase())) {
              procedures.push(this.parseProcedure());
              continue;
            }
            if (next && next.value.toLowerCase() === 'const') {
              declarations.push(this.parseConstDeclaration());
              continue;
            }
            if (next && next.value.toLowerCase() === 'type') {
              declarations.push(this.parseTypeDeclaration());
              continue;
            }
            if (next && next.value.toLowerCase() === 'enum') {
              declarations.push(this.parseEnumDeclaration());
              continue;
            }
          }
          declarations.push(this.parseVariableDeclaration());
        } else if (this.matchKeyword('const')) {
          declarations.push(this.parseConstDeclaration());
        } else if (this.matchKeyword('type')) {
          declarations.push(this.parseTypeDeclaration());
        } else if (this.matchKeyword('enum')) {
          declarations.push(this.parseEnumDeclaration());
        } else if (this.matchKeyword('declare')) {
          this.skipToNextLine(); // Skip Declare statements for now
        } else if (this.matchKeyword('implements')) {
          this.skipToNextLine();
        } else {
          this.skipToNextLine();
        }
      } catch {
        this.skipToNextLine();
      }
    }

    const end = this.current().range.end;
    return { type: 'module', options, declarations, procedures, range: { start, end } };
  }

  private peekNonNewline(offset: number): Token | null {
    let idx = this.pos + offset;
    while (idx < this.tokens.length) {
      if (this.tokens[idx].type !== TokenType.Newline && this.tokens[idx].type !== TokenType.Comment) {
        return this.tokens[idx];
      }
      idx++;
    }
    return null;
  }

  private isStartOfProcedure(): boolean {
    const tok = this.current();
    if (tok.type !== TokenType.Keyword) return false;
    const kw = tok.value.toLowerCase();
    if (['sub', 'function', 'property'].includes(kw)) return true;
    if (['public', 'private', 'friend'].includes(kw)) {
      const next = this.peekNonNewline(1);
      if (next && ['sub', 'function', 'property', 'static'].includes(next.value.toLowerCase())) return true;
    }
    if (kw === 'static') {
      const next = this.peekNonNewline(1);
      if (next && ['sub', 'function', 'property'].includes(next.value.toLowerCase())) return true;
    }
    return false;
  }

  // ---- Option ----

  private parseOptionStatement(): OptionStatement {
    const start = this.current().range.start;
    this.advance(); // 'Option'

    let option: 'explicit' | 'compare' | 'base';
    let value: string | undefined;

    if (this.matchKeyword('explicit')) {
      option = 'explicit';
      this.advance();
    } else if (this.matchKeyword('compare')) {
      option = 'compare';
      this.advance();
      value = this.current().value;
      this.advance();
    } else if (this.matchKeyword('base')) {
      option = 'base';
      this.advance();
      value = this.current().value;
      this.advance();
    } else {
      option = 'explicit'; // fallback
      this.skipToNextLine();
    }

    const end = this.current().range.start;
    this.skipToNextLine();
    return { type: 'option', option, value, range: { start, end } };
  }

  // ---- Procedures ----

  private parseProcedure(): Procedure {
    const start = this.current().range.start;
    let visibility: 'public' | 'private' | 'friend' | null = null;
    let isStatic = false;

    if (this.matchKeyword('public', 'private', 'friend')) {
      visibility = this.advance().value.toLowerCase() as 'public' | 'private' | 'friend';
    }
    if (this.matchKeyword('static')) {
      isStatic = true;
      this.advance();
    }

    if (this.matchKeyword('sub')) {
      return this.parseSub(start, visibility, isStatic);
    } else if (this.matchKeyword('function')) {
      return this.parseFunction(start, visibility, isStatic);
    } else if (this.matchKeyword('property')) {
      return this.parseProperty(start, visibility, isStatic);
    }

    // Fallback
    this.error('Expected Sub, Function, or Property');
    this.skipToNextLine();
    return {
      type: 'sub', name: '<error>', visibility, isStatic,
      parameters: [], body: [], range: { start, end: this.current().range.start },
    };
  }

  private parseSub(start: Position, visibility: 'public' | 'private' | 'friend' | null, isStatic: boolean): SubDeclaration {
    this.advance(); // 'Sub'
    const name = this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword
      ? this.advance().value : '<error>';
    const parameters = this.parseParameterList();
    this.skipToNextLine();

    const body = this.parseStatementBlock('sub');
    this.expectEndBlock('sub');

    return {
      type: 'sub', name, visibility, isStatic, parameters, body,
      range: { start, end: this.current().range.start },
    };
  }

  private parseFunction(start: Position, visibility: 'public' | 'private' | 'friend' | null, isStatic: boolean): FunctionDeclaration {
    this.advance(); // 'Function'
    const name = this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword
      ? this.advance().value : '<error>';
    const parameters = this.parseParameterList();
    let returnType: string | null = null;
    if (this.matchKeyword('as')) {
      this.advance();
      returnType = this.parseTypeName();
    }
    this.skipToNextLine();

    const body = this.parseStatementBlock('function');
    this.expectEndBlock('function');

    return {
      type: 'function', name, visibility, isStatic, parameters, returnType, body,
      range: { start, end: this.current().range.start },
    };
  }

  private parseProperty(start: Position, visibility: 'public' | 'private' | 'friend' | null, isStatic: boolean): PropertyDeclaration {
    this.advance(); // 'Property'
    let kind: 'get' | 'let' | 'set' = 'get';
    if (this.matchKeyword('get', 'let', 'set')) {
      kind = this.advance().value.toLowerCase() as 'get' | 'let' | 'set';
    }
    const name = this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword
      ? this.advance().value : '<error>';
    const parameters = this.parseParameterList();
    let returnType: string | null = null;
    if (this.matchKeyword('as')) {
      this.advance();
      returnType = this.parseTypeName();
    }
    this.skipToNextLine();

    const body = this.parseStatementBlock('property');
    this.expectEndBlock('property');

    return {
      type: 'property', kind, name, visibility, isStatic, parameters, returnType, body,
      range: { start, end: this.current().range.start },
    };
  }

  private expectEndBlock(blockType: string): void {
    if (this.matchKeyword('end')) {
      this.advance();
      if (this.matchKeyword(blockType)) {
        this.advance();
      }
      this.skipToNextLine();
    } else {
      const label = blockType.charAt(0).toUpperCase() + blockType.slice(1);
      this.error(`'${label}' block missing 'End ${label}'`);
    }
  }

  // ---- Parameters ----

  private parseParameterList(): Parameter[] {
    if (this.current().type !== TokenType.LeftParen) return [];
    this.advance(); // '('

    const params: Parameter[] = [];
    while (this.current().type !== TokenType.RightParen && !this.isEOF() && this.current().type !== TokenType.Newline) {
      const param = this.parseParameter();
      if (param) params.push(param);
      if (this.current().type === TokenType.Comma) {
        this.advance();
      }
    }

    if (this.current().type === TokenType.RightParen) {
      this.advance();
    }

    return params;
  }

  private parseParameter(): Parameter | null {
    const start = this.current().range.start;
    let passing: 'byval' | 'byref' | null = null;
    let isOptional = false;
    let isParamArray = false;

    if (this.matchKeyword('optional')) {
      isOptional = true;
      this.advance();
    }
    if (this.matchKeyword('byval')) {
      passing = 'byval';
      this.advance();
    } else if (this.matchKeyword('byref')) {
      passing = 'byref';
      this.advance();
    }
    if (this.matchKeyword('paramarray')) {
      isParamArray = true;
      this.advance();
    }

    if (this.current().type !== TokenType.Identifier && this.current().type !== TokenType.Keyword) {
      return null;
    }
    const name = this.advance().value;

    // Handle array notation: param()
    if (this.current().type === TokenType.LeftParen) {
      this.advance();
      if (this.current().type === TokenType.RightParen) this.advance();
    }

    let type: string | null = null;
    if (this.matchKeyword('as')) {
      this.advance();
      type = this.parseTypeName();
    }

    let defaultValue: string | null = null;
    if (this.current().type === TokenType.Operator && this.current().value === '=') {
      this.advance();
      defaultValue = '';
      while (!this.isEOF() && this.current().type !== TokenType.Comma
          && this.current().type !== TokenType.RightParen && this.current().type !== TokenType.Newline) {
        if (defaultValue) defaultValue += ' ';
        defaultValue += this.current().value;
        this.advance();
      }
    }

    return {
      name, type, passing, isOptional, isParamArray, defaultValue,
      range: { start, end: this.current().range.start },
    };
  }

  private parseTypeName(): string {
    let typeName = '';
    if (this.matchKeyword('new')) {
      typeName = 'New ';
      this.advance();
    }
    if (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword) {
      typeName += this.advance().value;
    }
    // Handle dotted type names like ADODB.Recordset
    while (this.current().type === TokenType.Dot) {
      this.advance();
      if (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword) {
        typeName += '.' + this.advance().value;
      }
    }
    return typeName || 'Variant';
  }

  // ---- Declarations ----

  private parseVariableDeclaration(): VariableDeclaration {
    const start = this.current().range.start;
    const visKw = this.advance().value.toLowerCase();
    const visibility = visKw as VariableDeclaration['visibility'];

    const variables: VariableItem[] = [];
    do {
      if (this.current().type === TokenType.Comma) this.advance();
      const varStart = this.current().range.start;
      const name = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
        ? this.advance().value : '<error>';
      let isArray = false;
      let dimensions: string | undefined;
      if (this.current().type === TokenType.LeftParen) {
        isArray = true;
        this.advance();
        dimensions = '';
        while (this.current().type !== TokenType.RightParen && !this.isEOF() && this.current().type !== TokenType.Newline) {
          dimensions += this.current().value;
          this.advance();
        }
        if (this.current().type === TokenType.RightParen) this.advance();
      }
      let varType: string | null = null;
      if (this.matchKeyword('as')) {
        this.advance();
        varType = this.parseTypeName();
      }
      variables.push({ name, varType, isArray, dimensions: dimensions || undefined, range: { start: varStart, end: this.current().range.start } });
    } while (this.current().type === TokenType.Comma);

    this.skipToNextLine();
    return { type: 'variable', visibility, variables, range: { start, end: this.current().range.start } };
  }

  private parseConstDeclaration(): ConstDeclaration {
    const start = this.current().range.start;
    let visibility: 'public' | 'private' | null = null;

    if (this.matchKeyword('public', 'private')) {
      visibility = this.advance().value.toLowerCase() as 'public' | 'private';
    }

    this.expectKeyword('const');
    const name = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
      ? this.advance().value : '<error>';

    let constType: string | null = null;
    if (this.matchKeyword('as')) {
      this.advance();
      constType = this.parseTypeName();
    }

    let value = '';
    if (this.current().type === TokenType.Operator && this.current().value === '=') {
      this.advance();
      value = this.collectToEndOfLine();
    }

    return { type: 'const', visibility, name, constType, value, range: { start, end: this.current().range.start } };
  }

  private parseTypeDeclaration(): TypeDeclaration {
    const start = this.current().range.start;
    let visibility: 'public' | 'private' | null = null;

    if (this.matchKeyword('public', 'private')) {
      visibility = this.advance().value.toLowerCase() as 'public' | 'private';
    }

    this.expectKeyword('type');
    const name = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
      ? this.advance().value : '<error>';
    this.skipToNextLine();

    const members: TypeMember[] = [];
    while (!this.isEOF()) {
      this.skipNewlines();
      if (this.matchKeyword('end')) {
        this.advance();
        if (this.matchKeyword('type')) this.advance();
        this.skipToNextLine();
        break;
      }
      const memberStart = this.current().range.start;
      const memberName = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
        ? this.advance().value : '<error>';
      let isArray = false;
      if (this.current().type === TokenType.LeftParen) {
        isArray = true;
        this.advance();
        while (this.current().type !== TokenType.RightParen && !this.isEOF() && this.current().type !== TokenType.Newline) {
          this.advance();
        }
        if (this.current().type === TokenType.RightParen) this.advance();
      }
      let memberType = 'Variant';
      if (this.matchKeyword('as')) {
        this.advance();
        memberType = this.parseTypeName();
      }
      members.push({ name: memberName, memberType, isArray, range: { start: memberStart, end: this.current().range.start } });
      this.skipToNextLine();
    }

    return { type: 'type', name, visibility, members, range: { start, end: this.current().range.start } };
  }

  private parseEnumDeclaration(): EnumDeclaration {
    const start = this.current().range.start;
    let visibility: 'public' | 'private' | null = null;

    if (this.matchKeyword('public', 'private')) {
      visibility = this.advance().value.toLowerCase() as 'public' | 'private';
    }

    this.expectKeyword('enum');
    const name = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
      ? this.advance().value : '<error>';
    this.skipToNextLine();

    const members: EnumMember[] = [];
    while (!this.isEOF()) {
      this.skipNewlines();
      if (this.matchKeyword('end')) {
        this.advance();
        if (this.matchKeyword('enum')) this.advance();
        this.skipToNextLine();
        break;
      }
      const memberStart = this.current().range.start;
      const memberName = (this.current().type === TokenType.Identifier || this.current().type === TokenType.Keyword)
        ? this.advance().value : '<error>';
      let value: string | null = null;
      if (this.current().type === TokenType.Operator && this.current().value === '=') {
        this.advance();
        value = this.collectToEndOfLine();
      } else {
        this.skipToNextLine();
      }
      members.push({ name: memberName, value, range: { start: memberStart, end: this.current().range.start } });
    }

    return { type: 'enum', name, visibility, members, range: { start, end: this.current().range.start } };
  }

  // ---- Statement Block ----

  private parseStatementBlock(endType: string): Statement[] {
    const statements: Statement[] = [];

    while (!this.isEOF()) {
      this.skipNewlines();
      if (this.isEOF()) break;

      // Check for block end
      if (this.matchKeyword('end')) {
        const next = this.peek(1);
        if (next.type === TokenType.Keyword && next.value.toLowerCase() === endType) {
          break;
        }
        if (endType === 'if' && next.type === TokenType.Keyword && next.value.toLowerCase() === 'if') {
          break;
        }
        if (endType === 'select' && next.type === TokenType.Keyword && next.value.toLowerCase() === 'select') {
          break;
        }
        // Standalone 'End' (program termination)
        if (next.type === TokenType.Newline || next.type === TokenType.EOF) {
          statements.push(this.parseGenericStatement());
          continue;
        }
      }

      // Check for Else/ElseIf (if parsing If block)
      if (endType === 'if' && (this.matchKeyword('else', 'elseif'))) {
        break;
      }

      // Check for Case (if parsing Select block)
      if (endType === 'select' && this.matchKeyword('case')) {
        break;
      }

      // Check for Loop/Wend/Next
      if (endType === 'do' && this.matchKeyword('loop')) break;
      if (endType === 'while' && this.matchKeyword('wend')) break;
      if (endType === 'for' && this.matchKeyword('next')) break;
      if (endType === 'with' && this.matchKeyword('end')) break;

      try {
        const stmt = this.parseStatement();
        if (stmt) statements.push(stmt);
      } catch {
        this.skipToNextLine();
      }
    }

    return statements;
  }

  // ---- Statements ----

  private parseStatement(): Statement | null {
    const tok = this.current();

    if (tok.type === TokenType.Newline) {
      this.advance();
      return null;
    }
    if (tok.type === TokenType.Comment) {
      this.advance();
      return null;
    }

    if (tok.type === TokenType.Keyword) {
      const kw = tok.value.toLowerCase();

      switch (kw) {
        case 'if': return this.parseIfStatement();
        case 'for': return this.parseForStatement();
        case 'do': return this.parseDoStatement();
        case 'while': return this.parseWhileStatement();
        case 'with': return this.parseWithStatement();
        case 'select': return this.parseSelectStatement();
        case 'dim': case 'static': case 'redim':
          return this.parseDimStatement();
        case 'const':
          return this.parseConstStatement();
        case 'set': return this.parseSetStatement();
        case 'let': return this.parseLetStatement();
        case 'call': return this.parseCallStatement();
        case 'exit': return this.parseExitStatement();
        case 'on': return this.parseOnErrorStatement();
        case 'goto': return this.parseGoToStatement();
        case 'gosub': return this.parseGoToStatement();
        case 'return':
          const start = this.current().range.start;
          this.advance();
          this.skipToNextLine();
          return { type: 'return', range: { start, end: this.current().range.start } };
        case 'debug':
          return this.parseGenericStatement();
        default:
          return this.parseGenericStatement();
      }
    }

    // Label: identifier followed by colon
    if (tok.type === TokenType.Identifier) {
      const next = this.peek(1);
      if (next.type === TokenType.Colon) {
        const start = tok.range.start;
        const name = this.advance().value;
        this.advance(); // ':'
        return { type: 'label', name, range: { start, end: this.current().range.start } };
      }
    }

    // Assignment or call
    return this.parseAssignmentOrCall();
  }

  private parseIfStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'If'

    const condition = this.collectUntilKeyword('then');
    if (!condition.trim()) {
      this.error("'If' statement missing condition");
    }
    if (this.matchKeyword('then')) {
      this.advance();
    } else {
      this.error("'If' statement missing 'Then'");
    }

    // Single-line If: If x Then stmt
    if (this.current().type !== TokenType.Newline && !this.isEOF()) {
      const thenBranch = [this.parseGenericStatement()];
      let elseBranch: Statement[] | null = null;
      // Check remaining tokens on same line for Else
      // Already consumed by parseGenericStatement
      return {
        type: 'if', condition, thenBranch, elseIfBranches: [], elseBranch,
        range: { start, end: this.current().range.start },
      } as Statement;
    }

    this.skipToNextLine();

    // Multi-line If
    const thenBranch = this.parseStatementBlock('if');
    const elseIfBranches: { condition: string; body: Statement[]; range: Range }[] = [];
    let elseBranch: Statement[] | null = null;

    while (this.matchKeyword('elseif')) {
      const eStart = this.current().range.start;
      this.advance();
      const eCond = this.collectUntilKeyword('then');
      if (this.matchKeyword('then')) this.advance();
      this.skipToNextLine();
      const eBody = this.parseStatementBlock('if');
      elseIfBranches.push({ condition: eCond, body: eBody, range: { start: eStart, end: this.current().range.start } });
    }

    if (this.matchKeyword('else')) {
      this.advance();
      this.skipToNextLine();
      elseBranch = this.parseStatementBlock('if');
    }

    if (this.matchKeyword('end')) {
      this.advance();
      if (this.matchKeyword('if')) this.advance();
      this.skipToNextLine();
    } else {
      this.error("'If' block missing 'End If'");
    }

    return {
      type: 'if', condition, thenBranch, elseIfBranches, elseBranch,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseForStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'For'

    if (this.matchKeyword('each')) {
      this.advance();
      const variable = this.current().type === TokenType.Identifier ? this.advance().value : '<error>';
      if (this.matchKeyword('in')) {
        this.advance();
      } else {
        this.error("'For Each' statement missing 'In'");
      }
      const collection = this.collectToEndOfLine();
      if (!collection.trim()) {
        this.error("'For Each' statement missing collection");
      }
      const body = this.parseStatementBlock('for');
      if (this.matchKeyword('next')) {
        this.advance();
        this.skipToNextLine();
      } else {
        this.error("'For Each' block missing 'Next'");
      }
      return {
        type: 'forEach', variable, collection, body,
        range: { start, end: this.current().range.start },
      } as Statement;
    }

    const variable = this.current().type === TokenType.Identifier ? this.advance().value : '<error>';
    let from = '';
    if (this.current().type === TokenType.Operator && this.current().value === '=') {
      this.advance();
      from = this.collectUntilKeyword('to');
    } else {
      this.error("'For' statement missing '='");
    }
    if (this.matchKeyword('to')) this.advance();
    else this.error("'For' statement missing 'To'");
    let to = '';
    let step: string | null = null;

    // Collect 'to' expression until Step or end of line
    while (!this.isEOF() && this.current().type !== TokenType.Newline && !this.matchKeyword('step')) {
      if (to) to += ' ';
      to += this.current().value;
      this.advance();
    }
    if (this.matchKeyword('step')) {
      this.advance();
      step = this.collectToEndOfLine();
    }
    this.skipToNextLine();

    const body = this.parseStatementBlock('for');
    if (this.matchKeyword('next')) {
      this.advance();
      this.skipToNextLine();
    } else {
      this.error("'For' block missing 'Next'");
    }

    return {
      type: 'for', variable, from, to, step, body,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseDoStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Do'

    let conditionType: 'while' | 'until' | null = null;
    let conditionPosition: 'pre' | 'post' | null = null;
    let condition: string | null = null;

    if (this.matchKeyword('while', 'until')) {
      conditionType = this.advance().value.toLowerCase() as 'while' | 'until';
      conditionPosition = 'pre';
      condition = this.collectToEndOfLine();
    } else {
      this.skipToNextLine();
    }

    const body = this.parseStatementBlock('do');

    if (this.matchKeyword('loop')) {
      this.advance();
      if (this.matchKeyword('while', 'until')) {
        conditionType = this.advance().value.toLowerCase() as 'while' | 'until';
        conditionPosition = 'post';
        condition = this.collectToEndOfLine();
      } else {
        this.skipToNextLine();
      }
    } else {
      this.error("'Do' block missing 'Loop'");
    }

    return {
      type: 'do', conditionType, conditionPosition, condition, body,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseWhileStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'While'
    const condition = this.collectToEndOfLine();
    if (!condition.trim()) {
      this.error("'While' statement missing condition");
    }
    const body = this.parseStatementBlock('while');
    if (this.matchKeyword('wend')) {
      this.advance();
      this.skipToNextLine();
    } else {
      this.error("'While' block missing 'Wend'");
    }
    return {
      type: 'while', condition, body,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseWithStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'With'
    const object = this.collectToEndOfLine();
    if (!object.trim()) {
      this.error("'With' statement missing object expression");
    }
    const body = this.parseStatementBlock('with');
    if (this.matchKeyword('end')) {
      this.advance();
      if (this.matchKeyword('with')) this.advance();
      this.skipToNextLine();
    } else {
      this.error("'With' block missing 'End With'");
    }
    return {
      type: 'with', object, body,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseSelectStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Select'
    if (this.matchKeyword('case')) this.advance();
    const expression = this.collectToEndOfLine();

    const cases: { expressions: string[]; body: Statement[]; range: Range }[] = [];
    let elseCase: Statement[] | null = null;

    while (!this.isEOF()) {
      this.skipNewlines();
      if (this.matchKeyword('end')) break;
      if (!this.matchKeyword('case')) break;

      const caseStart = this.current().range.start;
      this.advance(); // 'Case'

      if (this.matchKeyword('else')) {
        this.advance();
        this.skipToNextLine();
        elseCase = this.parseStatementBlock('select');
        break;
      }

      const expressions = [this.collectToEndOfLine()];
      const body = this.parseStatementBlock('select');
      cases.push({ expressions, body, range: { start: caseStart, end: this.current().range.start } });
    }

    if (this.matchKeyword('end')) {
      this.advance();
      if (this.matchKeyword('select')) this.advance();
      this.skipToNextLine();
    } else {
      this.error("'Select Case' block missing 'End Select'");
    }

    if (!expression.trim()) {
      this.error("'Select Case' statement missing expression");
    }

    return {
      type: 'select', expression, cases, elseCase,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseDimStatement(): Statement {
    const start = this.current().range.start;
    const kw = this.current().value.toLowerCase();

    if (kw === 'redim') {
      this.advance();
      const preserve = this.matchKeyword('preserve');
      if (preserve) this.advance();
      const variables: VariableItem[] = [];
      do {
        if (this.current().type === TokenType.Comma) this.advance();
        const vStart = this.current().range.start;
        const name = this.advance().value;
        let isArray = false;
        let dimensions: string | undefined;
        if (this.current().type === TokenType.LeftParen) {
          isArray = true;
          this.advance();
          dimensions = '';
          while (this.current().type !== TokenType.RightParen && !this.isEOF() && this.current().type !== TokenType.Newline) {
            dimensions += this.current().value;
            this.advance();
          }
          if (this.current().type === TokenType.RightParen) this.advance();
        }
        let varType: string | null = null;
        if (this.matchKeyword('as')) { this.advance(); varType = this.parseTypeName(); }
        variables.push({ name, varType, isArray, dimensions, range: { start: vStart, end: this.current().range.start } });
      } while (this.current().type === TokenType.Comma);
      this.skipToNextLine();
      return { type: 'redim', preserve, variables, range: { start, end: this.current().range.start } } as Statement;
    }

    const declaration = this.parseVariableDeclaration();
    return { type: 'dim', declaration, range: { start, end: this.current().range.start } } as Statement;
  }

  private parseConstStatement(): Statement {
    const start = this.current().range.start;
    const declaration = this.parseConstDeclaration();
    return { type: 'constStatement', declaration, range: { start, end: this.current().range.start } } as Statement;
  }

  private parseSetStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Set'
    const target = this.collectUntilOperator('=');
    if (this.current().type === TokenType.Operator && this.current().value === '=') this.advance();
    const value = this.collectToEndOfLine();
    return {
      type: 'assignment', target, isSet: true, isLet: false, value,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseLetStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Let'
    const target = this.collectUntilOperator('=');
    if (this.current().type === TokenType.Operator && this.current().value === '=') this.advance();
    const value = this.collectToEndOfLine();
    return {
      type: 'assignment', target, isSet: false, isLet: true, value,
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseCallStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Call'
    const target = this.collectToEndOfLine();
    return {
      type: 'call', target, arguments: '',
      range: { start, end: this.current().range.start },
    } as Statement;
  }

  private parseExitStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'Exit'
    const exitType = this.current().type === TokenType.Keyword ? this.advance().value.toLowerCase() : '';
    this.skipToNextLine();
    return { type: 'exit', exitType, range: { start, end: this.current().range.start } } as Statement;
  }

  private parseOnErrorStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'On'
    if (this.matchKeyword('error')) this.advance();
    const action = this.collectToEndOfLine();
    return { type: 'onError', action, range: { start, end: this.current().range.start } } as Statement;
  }

  private parseGoToStatement(): Statement {
    const start = this.current().range.start;
    this.advance(); // 'GoTo' or 'GoSub'
    const label = this.current().type !== TokenType.Newline && !this.isEOF() ? this.advance().value : '';
    this.skipToNextLine();
    return { type: 'goto', label, range: { start, end: this.current().range.start } } as Statement;
  }

  private parseAssignmentOrCall(): Statement {
    const start = this.current().range.start;
    // Collect left side until = or end of line
    const allTokens: string[] = [];
    let hasAssignment = false;
    let checkpoint = this.pos;

    // Scan ahead to find = that's an assignment (not comparison)
    let depth = 0;
    let scanPos = this.pos;
    while (scanPos < this.tokens.length) {
      const t = this.tokens[scanPos];
      if (t.type === TokenType.Newline || t.type === TokenType.EOF) break;
      if (t.type === TokenType.LeftParen) depth++;
      if (t.type === TokenType.RightParen) depth--;
      if (t.type === TokenType.Operator && t.value === '=' && depth === 0) {
        hasAssignment = true;
        break;
      }
      scanPos++;
    }

    if (hasAssignment) {
      const target = this.collectUntilOperator('=');
      if (this.current().type === TokenType.Operator && this.current().value === '=') this.advance();
      const value = this.collectToEndOfLine();
      return {
        type: 'assignment', target, isSet: false, isLet: false, value,
        range: { start, end: this.current().range.start },
      } as Statement;
    }

    return this.parseGenericStatement();
  }

  private parseGenericStatement(): Statement {
    const start = this.current().range.start;
    const text = this.collectToEndOfLine();
    return { type: 'generic', text, range: { start, end: this.current().range.start } } as Statement;
  }

  // ---- Helpers ----

  private collectUntilKeyword(keyword: string): string {
    let text = '';
    while (!this.isEOF() && this.current().type !== TokenType.Newline) {
      if (this.matchKeyword(keyword)) break;
      if (text) text += ' ';
      text += this.current().value;
      this.advance();
    }
    return text;
  }

  private collectUntilOperator(op: string): string {
    let text = '';
    let depth = 0;
    while (!this.isEOF() && this.current().type !== TokenType.Newline) {
      if (this.current().type === TokenType.LeftParen) depth++;
      if (this.current().type === TokenType.RightParen) depth--;
      if (this.current().type === TokenType.Operator && this.current().value === op && depth === 0) break;
      if (text) text += ' ';
      text += this.current().value;
      this.advance();
    }
    return text;
  }
}

export function parseModule(text: string): ParseResult {
  const parser = new Parser();
  return parser.parse(text);
}

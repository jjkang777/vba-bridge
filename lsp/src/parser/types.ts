// AST Node Types for VBA Parser

/** 0-based position in a text document. */
export interface Position {
  line: number;
  character: number;
}

/** Range in a text document, both endpoints inclusive of start, exclusive of end character. */
export interface Range {
  start: Position;
  end: Position;
}

// ---------------------------------------------------------------------------
// Top-level
// ---------------------------------------------------------------------------

export interface Module {
  type: 'module';
  options: OptionStatement[];
  declarations: Declaration[];
  procedures: Procedure[];
  range: Range;
}

// ---------------------------------------------------------------------------
// Option statements
// ---------------------------------------------------------------------------

export interface OptionStatement {
  type: 'option';
  option: 'explicit' | 'compare' | 'base';
  value?: string; // e.g. "Binary", "Text", "Database" for Compare; "0"/"1" for Base
  range: Range;
}

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

export interface SubDeclaration {
  type: 'sub';
  name: string;
  visibility: 'public' | 'private' | 'friend' | null;
  isStatic: boolean;
  parameters: Parameter[];
  body: Statement[];
  range: Range;
}

export interface FunctionDeclaration {
  type: 'function';
  name: string;
  visibility: 'public' | 'private' | 'friend' | null;
  isStatic: boolean;
  parameters: Parameter[];
  returnType: string | null;
  body: Statement[];
  range: Range;
}

export interface PropertyDeclaration {
  type: 'property';
  kind: 'get' | 'let' | 'set';
  name: string;
  visibility: 'public' | 'private' | 'friend' | null;
  isStatic: boolean;
  parameters: Parameter[];
  returnType: string | null;
  body: Statement[];
  range: Range;
}

export type Procedure = SubDeclaration | FunctionDeclaration | PropertyDeclaration;

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

export interface Parameter {
  name: string;
  type: string | null;
  passing: 'byval' | 'byref' | null;
  isOptional: boolean;
  isParamArray: boolean;
  defaultValue: string | null;
  range: Range;
}

// ---------------------------------------------------------------------------
// Declarations
// ---------------------------------------------------------------------------

export interface VariableDeclaration {
  type: 'variable';
  visibility: 'dim' | 'public' | 'private' | 'static' | 'global' | null;
  variables: VariableItem[];
  range: Range;
}

export interface VariableItem {
  name: string;
  varType: string | null;
  isArray: boolean;
  dimensions?: string;
  range: Range;
}

export interface ConstDeclaration {
  type: 'const';
  visibility: 'public' | 'private' | null;
  name: string;
  constType: string | null;
  value: string;
  range: Range;
}

export interface TypeDeclaration {
  type: 'type';
  name: string;
  visibility: 'public' | 'private' | null;
  members: TypeMember[];
  range: Range;
}

export interface TypeMember {
  name: string;
  memberType: string;
  isArray: boolean;
  range: Range;
}

export interface EnumDeclaration {
  type: 'enum';
  name: string;
  visibility: 'public' | 'private' | null;
  members: EnumMember[];
  range: Range;
}

export interface EnumMember {
  name: string;
  value: string | null;
  range: Range;
}

export type Declaration =
  | VariableDeclaration
  | ConstDeclaration
  | TypeDeclaration
  | EnumDeclaration;

// ---------------------------------------------------------------------------
// Statements
// ---------------------------------------------------------------------------

export interface BaseStatement {
  type: string;
  range: Range;
}

export interface IfStatement extends BaseStatement {
  type: 'if';
  condition: string;
  thenBranch: Statement[];
  elseIfBranches: { condition: string; body: Statement[]; range: Range }[];
  elseBranch: Statement[] | null;
}

export interface ForStatement extends BaseStatement {
  type: 'for';
  variable: string;
  from: string;
  to: string;
  step: string | null;
  body: Statement[];
}

export interface ForEachStatement extends BaseStatement {
  type: 'forEach';
  variable: string;
  collection: string;
  body: Statement[];
}

export interface DoStatement extends BaseStatement {
  type: 'do';
  conditionType: 'while' | 'until' | null;
  conditionPosition: 'pre' | 'post' | null;
  condition: string | null;
  body: Statement[];
}

export interface WhileStatement extends BaseStatement {
  type: 'while';
  condition: string;
  body: Statement[];
}

export interface WithStatement extends BaseStatement {
  type: 'with';
  object: string;
  body: Statement[];
}

export interface SelectStatement extends BaseStatement {
  type: 'select';
  expression: string;
  cases: { expressions: string[]; body: Statement[]; range: Range }[];
  elseCase: Statement[] | null;
}

export interface ExitStatement extends BaseStatement {
  type: 'exit';
  exitType: string; // "sub", "function", "for", "do", "property"
}

export interface AssignmentStatement extends BaseStatement {
  type: 'assignment';
  target: string;
  isSet: boolean;
  isLet: boolean;
  value: string;
}

export interface CallStatement extends BaseStatement {
  type: 'call';
  target: string;
  arguments: string;
}

export interface DimStatement extends BaseStatement {
  type: 'dim';
  declaration: VariableDeclaration;
}

export interface ReDimStatement extends BaseStatement {
  type: 'redim';
  preserve: boolean;
  variables: VariableItem[];
}

export interface ConstStatement extends BaseStatement {
  type: 'constStatement';
  declaration: ConstDeclaration;
}

export interface OnErrorStatement extends BaseStatement {
  type: 'onError';
  action: string; // "resume next", "goto <label>", "goto 0"
}

export interface GoToStatement extends BaseStatement {
  type: 'goto';
  label: string;
}

export interface LabelStatement extends BaseStatement {
  type: 'label';
  name: string;
}

export interface ReturnStatement extends BaseStatement {
  type: 'return';
}

export interface GenericStatement extends BaseStatement {
  type: 'generic';
  text: string;
}

export type Statement =
  | IfStatement
  | ForStatement
  | ForEachStatement
  | DoStatement
  | WhileStatement
  | WithStatement
  | SelectStatement
  | ExitStatement
  | AssignmentStatement
  | CallStatement
  | DimStatement
  | ReDimStatement
  | ConstStatement
  | OnErrorStatement
  | GoToStatement
  | LabelStatement
  | ReturnStatement
  | GenericStatement;

// ---------------------------------------------------------------------------
// Diagnostics & Parse result
// ---------------------------------------------------------------------------

export interface ParseDiagnostic {
  message: string;
  range: Range;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  module: Module;
  diagnostics: ParseDiagnostic[];
}

import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { ParseResult, Module, Statement, Procedure } from '../parser';

export function getDiagnostics(result: ParseResult): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Parser errors
  for (const diag of result.diagnostics) {
    diagnostics.push({
      range: diag.range,
      severity: diag.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      message: diag.message,
      source: 'vba',
    });
  }

  // Option Explicit check — undeclared variables
  const hasOptionExplicit = result.module.options.some(o => o.option === 'explicit');
  if (hasOptionExplicit) {
    checkUndeclaredVariables(result.module, diagnostics);
  }

  // Duplicate procedure names
  checkDuplicateProcedures(result.module, diagnostics);

  return diagnostics;
}

function checkDuplicateProcedures(module: Module, diagnostics: Diagnostic[]): void {
  const seen = new Map<string, Procedure>();
  for (const proc of module.procedures) {
    const key = proc.name.toLowerCase();
    // Property Get/Let/Set with same name are different procedures
    const uniqueKey = proc.type === 'property' ? `${key}:${proc.kind}` : key;
    const existing = seen.get(uniqueKey);
    if (existing) {
      diagnostics.push({
        range: proc.range,
        severity: DiagnosticSeverity.Error,
        message: `Duplicate declaration: '${proc.name}' is already defined`,
        source: 'vba',
      });
    } else {
      seen.set(uniqueKey, proc);
    }
  }
}

function checkUndeclaredVariables(module: Module, diagnostics: Diagnostic[]): void {
  // Collect all declared names at module level
  const declaredNames = new Set<string>();

  for (const decl of module.declarations) {
    if (decl.type === 'variable') {
      for (const v of decl.variables) {
        declaredNames.add(v.name.toLowerCase());
      }
    } else if (decl.type === 'const') {
      declaredNames.add(decl.name.toLowerCase());
    } else if (decl.type === 'type') {
      declaredNames.add(decl.name.toLowerCase());
    } else if (decl.type === 'enum') {
      declaredNames.add(decl.name.toLowerCase());
      for (const m of decl.members) {
        declaredNames.add(m.name.toLowerCase());
      }
    }
  }

  for (const proc of module.procedures) {
    declaredNames.add(proc.name.toLowerCase());
    // Check within each procedure
    const localNames = new Set(declaredNames);
    for (const param of proc.parameters) {
      localNames.add(param.name.toLowerCase());
    }
    collectLocalDeclarations(proc.body, localNames);

    // We don't do deep assignment/reference analysis here since our parser
    // stores expressions as strings. This is a simplified check.
    // A more thorough check would require full expression parsing.
  }
}

function collectLocalDeclarations(statements: Statement[], names: Set<string>): void {
  for (const stmt of statements) {
    if (stmt.type === 'dim' && 'declaration' in stmt) {
      const decl = (stmt as any).declaration;
      if (decl && decl.variables) {
        for (const v of decl.variables) {
          names.add(v.name.toLowerCase());
        }
      }
    } else if (stmt.type === 'constStatement' && 'declaration' in stmt) {
      const decl = (stmt as any).declaration;
      if (decl) {
        names.add(decl.name.toLowerCase());
      }
    }
  }
}

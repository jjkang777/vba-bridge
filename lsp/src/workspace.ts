import { parseModule, ParseResult, Module, Procedure, Declaration, VariableDeclaration, ConstDeclaration, TypeDeclaration, EnumDeclaration, Range } from './parser';

export interface SymbolInfo {
  name: string;
  kind: 'sub' | 'function' | 'property' | 'variable' | 'const' | 'type' | 'enum' | 'enumMember';
  uri: string;
  range: Range;
  detail?: string; // e.g., return type, parameter list
  parameters?: { name: string; type: string | null }[];
  returnType?: string | null;
  visibility?: string | null;
}

export class WorkspaceIndex {
  private documents = new Map<string, { text: string; result: ParseResult }>();

  updateDocument(uri: string, text: string): ParseResult {
    const result = parseModule(text);
    this.documents.set(uri, { text, result });
    return result;
  }

  removeDocument(uri: string): void {
    this.documents.delete(uri);
  }

  getParseResult(uri: string): ParseResult | undefined {
    return this.documents.get(uri)?.result;
  }

  getText(uri: string): string | undefined {
    return this.documents.get(uri)?.text;
  }

  getSymbol(name: string): SymbolInfo | undefined {
    const lower = name.toLowerCase();
    for (const [uri, doc] of this.documents) {
      const sym = this.findSymbolInModule(uri, doc.result.module, lower);
      if (sym) return sym;
    }
    return undefined;
  }

  getSymbolsInModule(uri: string): SymbolInfo[] {
    const doc = this.documents.get(uri);
    if (!doc) return [];
    return this.collectSymbols(uri, doc.result.module);
  }

  getAllSymbols(): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    for (const [uri, doc] of this.documents) {
      symbols.push(...this.collectSymbols(uri, doc.result.module));
    }
    return symbols;
  }

  getAllDocumentUris(): string[] {
    return Array.from(this.documents.keys());
  }

  private findSymbolInModule(uri: string, module: Module, lowerName: string): SymbolInfo | undefined {
    for (const proc of module.procedures) {
      if (proc.name.toLowerCase() === lowerName) {
        return this.procedureToSymbol(uri, proc);
      }
    }
    for (const decl of module.declarations) {
      if (decl.type === 'variable') {
        for (const v of decl.variables) {
          if (v.name.toLowerCase() === lowerName) {
            return { name: v.name, kind: 'variable', uri, range: v.range, detail: v.varType || 'Variant' };
          }
        }
      } else if (decl.type === 'const' && decl.name.toLowerCase() === lowerName) {
        return { name: decl.name, kind: 'const', uri, range: decl.range, detail: decl.constType || 'Variant' };
      } else if (decl.type === 'type' && decl.name.toLowerCase() === lowerName) {
        return { name: decl.name, kind: 'type', uri, range: decl.range };
      } else if (decl.type === 'enum') {
        if (decl.name.toLowerCase() === lowerName) {
          return { name: decl.name, kind: 'enum', uri, range: decl.range };
        }
        for (const member of decl.members) {
          if (member.name.toLowerCase() === lowerName) {
            return { name: member.name, kind: 'enumMember', uri, range: member.range };
          }
        }
      }
    }
    return undefined;
  }

  private collectSymbols(uri: string, module: Module): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];

    for (const proc of module.procedures) {
      symbols.push(this.procedureToSymbol(uri, proc));
    }

    for (const decl of module.declarations) {
      if (decl.type === 'variable') {
        for (const v of decl.variables) {
          symbols.push({ name: v.name, kind: 'variable', uri, range: v.range, detail: v.varType || 'Variant' });
        }
      } else if (decl.type === 'const') {
        symbols.push({ name: decl.name, kind: 'const', uri, range: decl.range, detail: decl.constType || 'Variant' });
      } else if (decl.type === 'type') {
        symbols.push({ name: decl.name, kind: 'type', uri, range: decl.range });
      } else if (decl.type === 'enum') {
        symbols.push({ name: decl.name, kind: 'enum', uri, range: decl.range });
        for (const member of decl.members) {
          symbols.push({ name: member.name, kind: 'enumMember', uri, range: member.range });
        }
      }
    }

    return symbols;
  }

  private procedureToSymbol(uri: string, proc: Procedure): SymbolInfo {
    const params = proc.parameters.map(p => ({ name: p.name, type: p.type }));
    const returnType = proc.type === 'function' || proc.type === 'property' ? proc.returnType : null;
    const detail = this.formatProcedureSignature(proc);
    return {
      name: proc.name,
      kind: proc.type === 'sub' ? 'sub' : proc.type === 'function' ? 'function' : 'property',
      uri,
      range: proc.range,
      detail,
      parameters: params,
      returnType,
      visibility: proc.visibility,
    };
  }

  private formatProcedureSignature(proc: Procedure): string {
    const params = proc.parameters.map(p => {
      let s = '';
      if (p.isOptional) s += 'Optional ';
      if (p.passing) s += p.passing === 'byval' ? 'ByVal ' : 'ByRef ';
      s += p.name;
      if (p.type) s += ' As ' + p.type;
      if (p.defaultValue) s += ' = ' + p.defaultValue;
      return s;
    }).join(', ');

    let sig = '';
    if (proc.type === 'sub') sig = `Sub ${proc.name}(${params})`;
    else if (proc.type === 'function') sig = `Function ${proc.name}(${params})${proc.returnType ? ' As ' + proc.returnType : ''}`;
    else sig = `Property ${proc.kind.charAt(0).toUpperCase() + proc.kind.slice(1)} ${proc.name}(${params})${proc.returnType ? ' As ' + proc.returnType : ''}`;

    return sig;
  }
}

import { SignatureHelp, SignatureInformation, ParameterInformation, TextDocumentPositionParams } from 'vscode-languageserver';
import { WorkspaceIndex } from '../workspace';
import { getStubClass, getGlobalFunction, getStubMember } from '../stubs';
import { StubMember } from '../stubs/types';

export function getSignatureHelp(
  params: TextDocumentPositionParams,
  workspace: WorkspaceIndex,
  documentText: string,
): SignatureHelp | null {
  const line = documentText.split('\n')[params.position.line] || '';
  const textBefore = line.substring(0, params.position.character);

  // Find the function call context: walk back to find unmatched '('
  const context = findCallContext(textBefore);
  if (!context) return null;

  const { functionName, objectName, activeParameter } = context;

  // Look up the function
  let stubMember: StubMember | undefined;

  if (objectName) {
    // Member call: object.method(
    stubMember = getStubMember(objectName, functionName);
  }

  if (!stubMember) {
    // Global VBA function
    stubMember = getGlobalFunction(functionName);
  }

  if (!stubMember && !objectName) {
    // User-defined symbol
    const sym = workspace.getSymbol(functionName);
    if (sym && sym.parameters) {
      const symParamInfos: ParameterInformation[] = sym.parameters.map(p => ({
        label: `${p.name}${p.type ? ' As ' + p.type : ''}`,
      }));
      const sig = sym.detail || `${functionName}(${sym.parameters.map(p => p.name).join(', ')})`;
      return {
        signatures: [{
          label: sig,
          parameters: symParamInfos,
        }],
        activeSignature: 0,
        activeParameter,
      };
    }
    return null;
  }

  if (!stubMember || !stubMember.parameters || stubMember.parameters.length === 0) {
    return null;
  }

  const paramInfos: ParameterInformation[] = stubMember.parameters.map(p => ({
    label: `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`,
    documentation: p.description,
  }));

  const paramStr = stubMember.parameters
    .map(p => `${p.optional ? '[' : ''}${p.name} As ${p.type}${p.optional ? ']' : ''}`)
    .join(', ');

  const signature: SignatureInformation = {
    label: `${functionName}(${paramStr}) As ${stubMember.returnType}`,
    documentation: stubMember.description,
    parameters: paramInfos,
  };

  return {
    signatures: [signature],
    activeSignature: 0,
    activeParameter,
  };
}

function findCallContext(text: string): { functionName: string; objectName: string | null; activeParameter: number } | null {
  let depth = 0;
  let commaCount = 0;
  let parenPos = -1;

  // Walk backwards to find the unmatched '('
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) {
        parenPos = i;
        break;
      }
      depth--;
    } else if (ch === ',' && depth === 0) {
      commaCount++;
    }
  }

  if (parenPos < 0) return null;

  // Extract function name before the '('
  const before = text.substring(0, parenPos).trimEnd();
  const match = before.match(/(\w+)\s*$/);
  if (!match) return null;

  const functionName = match[1];

  // Check for object.method pattern
  const dotMatch = before.match(/(\w+)\.\s*(\w+)\s*$/);
  if (dotMatch) {
    return {
      objectName: dotMatch[1],
      functionName: dotMatch[2],
      activeParameter: commaCount,
    };
  }

  return {
    objectName: null,
    functionName,
    activeParameter: commaCount,
  };
}

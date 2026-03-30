import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
  InitializeResult,
  CompletionItem,
  Hover,
  Location,
  TextEdit,
  SignatureHelp,
  Diagnostic,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { WorkspaceIndex } from './workspace';
import { getCompletions } from './features/completion';
import { getDiagnostics } from './features/diagnostics';
import { getHover } from './features/hover';
import { getDefinition } from './features/definition';
import { getReferences } from './features/references';
import { formatDocument } from './features/formatting';
import { getSignatureHelp } from './features/signatureHelp';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const workspace = new WorkspaceIndex();

let formattingOptions = {
  indentSize: 4,
  keywordCase: 'PascalCase' as 'PascalCase' | 'lowercase' | 'UPPERCASE' | 'preserve',
};

connection.onInitialize((): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        triggerCharacters: ['.'],
      },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentFormattingProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
      },
    },
  };
});

connection.onInitialized(() => {
  connection.workspace.getConfiguration('vba').then((config: any) => {
    if (config) {
      if (config.formatting?.indentSize) formattingOptions.indentSize = config.formatting.indentSize;
      if (config.formatting?.keywordCase) formattingOptions.keywordCase = config.formatting.keywordCase;
    }
  });
});

// Document sync
documents.onDidChangeContent((change) => {
  const uri = change.document.uri;
  const text = change.document.getText();
  const result = workspace.updateDocument(uri, text);

  // Publish diagnostics
  const diagnostics: Diagnostic[] = getDiagnostics(result);
  connection.sendDiagnostics({ uri, diagnostics });
});

documents.onDidClose((event) => {
  workspace.removeDocument(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// Completion
connection.onCompletion((params): CompletionItem[] => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getCompletions(params, workspace, doc.getText());
});

// Hover
connection.onHover((params): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  return getHover(params, workspace, doc.getText());
});

// Go to Definition
connection.onDefinition((params): Location | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  return getDefinition(params, workspace, doc.getText());
});

// Find References
connection.onReferences((params): Location[] => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getReferences(params, workspace, doc.getText());
});

// Formatting
connection.onDocumentFormatting((params): TextEdit[] => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return formatDocument(doc.getText(), formattingOptions);
});

// Signature Help
connection.onSignatureHelp((params): SignatureHelp | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  return getSignatureHelp(params, workspace, doc.getText());
});

// Configuration change
connection.onDidChangeConfiguration((change) => {
  const config = change.settings?.vba;
  if (config) {
    if (config.formatting?.indentSize) formattingOptions.indentSize = config.formatting.indentSize;
    if (config.formatting?.keywordCase) formattingOptions.keywordCase = config.formatting.keywordCase;
  }

  // Re-validate all documents
  documents.all().forEach((doc) => {
    const text = doc.getText();
    const result = workspace.updateDocument(doc.uri, text);
    connection.sendDiagnostics({ uri: doc.uri, diagnostics: getDiagnostics(result) });
  });
});

documents.listen(connection);
connection.listen();

# VBA for VS Code

A VS Code extension providing VBA language support with IntelliSense, diagnostics, formatting, and Excel integration.

## Features

### Language Support (works on macOS and Windows)
- **Syntax highlighting** for `.bas`, `.cls`, and `.frm` files
- **IntelliSense** — completions for VBA keywords, Excel object model members (after `.`), and your own procedures/variables
- **Signature help** — parameter hints when calling functions
- **Hover information** — documentation for Excel classes, members, and built-in functions
- **Go to definition** / **Find references** — navigate your codebase
- **Diagnostics** — syntax errors, undeclared variables (with `Option Explicit`), duplicate procedure names
- **Formatting** — auto-indent, configurable keyword casing (`PascalCase`, `lowercase`, `UPPERCASE`)

### Excel Integration (Windows only)
- **Pull from Excel** — export VBA modules from an open workbook to local files
- **Push to Excel** — send edited files back into the workbook
- **List Workbooks** — pick from currently open Excel workbooks

### CLI Syntax Checker
- Run `npm run check -- <file.bas>` from the repo root to check files for syntax errors without opening VS Code

## Prerequisites

- **VS Code** 1.85 or later
- **Node.js** 18+ and npm
- **Windows** (for Excel integration): .NET Framework 4.7.2+ (pre-installed on Windows 10/11), Excel with VBA trust access enabled

## Quick Start

### 1. Clone and build

```bash
git clone <repo-url> vba
cd vba
npm install
cd extension && npm install && cd ..
cd lsp && npm install && cd ..
npm run build
```

### 2. Run in VS Code

1. Open the `vba/` folder in VS Code
2. Press **F5** (or Run > Start Debugging)
3. A new VS Code window opens (the Extension Development Host)
4. Open any `.bas`, `.cls`, or `.frm` file — syntax highlighting and IntelliSense activate automatically

The `test-workspace/Module1.bas` file is included for quick testing.

### 3. Use the CLI checker

```bash
npm run check -- test-workspace/Module1.bas
```

Output shows syntax errors with file, line, and column:

```
test-workspace/Module1.bas:103:5: error: Expected end of statement
test-workspace/Module1.bas:121:8: error: Expected condition after If
test-workspace/Module1.bas:122:18: error: Expected 'In' after loop variable in For Each
```

## Excel Integration (Windows)

### Build the C# bridge

```bash
cd bridge
msbuild bridge.csproj
```

This produces `bridge/bin/Debug/bridge.exe`.

### Enable VBA trust access in Excel

1. Open Excel > **File > Options > Trust Center > Trust Center Settings**
2. Go to **Macro Settings**
3. Check **Trust access to the VBA project object model**

### Pull modules from Excel

1. Open a `.xlsm` workbook in Excel
2. In VS Code, run **Ctrl+Shift+P** > `VBA: Pull from Excel`
3. Select the workbook from the picker
4. Modules are exported to your workspace as `.bas`/`.cls`/`.frm` files

### Push modules to Excel

1. Edit your VBA files in VS Code
2. Run **Ctrl+Shift+P** > `VBA: Push to Excel`
3. The extension sends all files back to the linked workbook

A `.vbaproj.json` file in your workspace root tracks the linked workbook path.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `vba.bridge.path` | (bundled) | Path to the bridge executable |
| `vba.formatting.indentSize` | `4` | Spaces per indent level |
| `vba.formatting.keywordCase` | `PascalCase` | Keyword casing: `PascalCase`, `lowercase`, `UPPERCASE`, `preserve` |

## Project Structure

```
vba/
  extension/     VS Code extension (activation, commands, bridge client)
  lsp/           Language server (parser, completions, diagnostics, etc.)
  grammars/      TextMate grammar for syntax highlighting
  bridge/        C# COM bridge for Excel push/pull (Windows)
  test-workspace/  Sample VBA files for testing
```

## Testing on macOS

Everything except Excel integration works on macOS:
- Syntax highlighting, IntelliSense, diagnostics, formatting, hover, go-to-definition, references, signature help, and the CLI checker all work.
- The Pull/Push/List commands require Excel COM and only work on Windows.

## Packaging as .vsix (optional)

```bash
npm install -g @vscode/vsce
cd extension
vsce package
```

Install the resulting `.vsix` via **Extensions > ... > Install from VSIX**.

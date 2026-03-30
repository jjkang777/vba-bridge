import * as fs from 'fs';
import * as path from 'path';
import { parseModule } from './parser';

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('Usage: vba-check <file.bas> [file2.cls] ...');
  console.error('       vba-check src/*.bas');
  process.exit(1);
}

let totalErrors = 0;
let totalWarnings = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    totalErrors++;
    continue;
  }

  const text = fs.readFileSync(file, 'utf-8');
  const result = parseModule(text);

  for (const diag of result.diagnostics) {
    const loc = `${file}:${diag.range.start.line + 1}:${diag.range.start.character + 1}`;
    const severity = diag.severity === 'error' ? 'error' : 'warning';
    console.log(`${loc}: ${severity}: ${diag.message}`);
    if (diag.severity === 'error') totalErrors++;
    else totalWarnings++;
  }

  // Summary per file
  const procs = result.module.procedures.length;
  const decls = result.module.declarations.length;
  const errs = result.diagnostics.filter(d => d.severity === 'error').length;
  if (errs === 0) {
    console.log(`${file}: OK (${procs} procedures, ${decls} declarations)`);
  }
}

console.log(`\n${files.length} file(s) checked: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
process.exit(totalErrors > 0 ? 1 : 0);

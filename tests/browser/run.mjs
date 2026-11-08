// Runs the browser suites against the built site. Usage: node tests/browser/run.mjs [suite ...]
// Suites: modal, mobile (default: both). Build first (`npm run test:browser` does both).
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const suites = process.argv.slice(2).length ? process.argv.slice(2) : ['modal', 'mobile'];
const port = process.env.PORT || 4173;
const server = await serve(port);
const base = `http://127.0.0.1:${port}/`;

const failed = [];
for (const suite of suites) {
  console.log(`\n=== ${suite} ===`);
  const code = await new Promise((resolve) => {
    spawn(process.execPath, [join(here, `${suite}.test.mjs`), base], { stdio: 'inherit' }).on('exit', resolve);
  });
  if (code !== 0) failed.push(suite);
}
server.close();
console.log(failed.length ? `\nFailed: ${failed.join(', ')}` : '\nAll browser suites passed');
process.exit(failed.length ? 1 : 0);

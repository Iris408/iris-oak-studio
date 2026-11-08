// Shared helpers for the browser suites: launches headless Chrome, talks to it over the DevTools protocol,
// and records console errors and failed requests (so a missing image fails the run).
// Chrome is found from CHROME_PATH or the usual install locations. Needs Node 22+ (global WebSocket).
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const found = candidates.find((p) => existsSync(p));
  if (found) return found;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [name], { encoding: 'utf8' }).trim(); } catch { /* try the next one */ }
  }
  throw new Error('Chrome not found: set CHROME_PATH to a Chrome or Chromium executable');
}

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'iris-oak-tests-'));
  const chrome = spawn(findChrome(), [
    '--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });

  // Chrome writes the port it picked to DevToolsActivePort in the profile
  let port;
  for (let i = 0; i < 80 && !port; i++) {
    try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch { await sleep(125); }
  }
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch { await sleep(250); }
  }
  if (!target) throw new Error('could not connect to Chrome');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  const failedRequests = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.exception?.description);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    // Vercel Analytics' script (/_vercel/insights) only exists on Vercel, so it's expected to 404 locally
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !m.params.response.url.includes('/_vercel/')) failedRequests.push(`${m.params.response.status} ${m.params.response.url}`);
    if (m.method === 'Network.loadingFailed' && !m.params.canceled) failedRequests.push(`${m.params.errorText} ${m.params.requestId}`);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('DOM.enable'); await send('Accessibility.enable');

  const close = () => {
    ws.close(); chrome.kill();
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold files briefly */ }
  };
  return { send, evaluate, consoleErrors, failedRequests, close };
}

// PASS/FAIL lines and a summary; the process exits non-zero if anything failed
export function reporter() {
  let pass = 0;
  let fail = 0;
  return {
    check: (name, ok, detail = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> ${detail}`}`); },
    error: (e) => { fail++; console.log('ERROR', e.stack || e.message); },
    finish: () => { console.log(`\n${pass} passed, ${fail} failed`); return fail ? 1 : 0; }
  };
}

// Screenshots are only saved when SHOTS_DIR is set (tests/browser/screenshots/ is git-ignored)
export function screenshotter(send) {
  const dir = process.env.SHOTS_DIR;
  if (dir) mkdirSync(dir, { recursive: true });
  return async (name, clip) => {
    if (!dir) return;
    const { data } = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 }, captureBeyondViewport: true } : {}) });
    writeFileSync(join(dir, `${name}.png`), Buffer.from(data, 'base64'));
  };
}

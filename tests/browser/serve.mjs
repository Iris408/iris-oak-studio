// Serves the built site (dist/) with the vercel.json rules the site relies on: cleanUrls (/portfolio -> portfolio.html),
// redirects (308 when permanent, with :path* sources) and 404.html for unknown paths.
// Usage: node tests/browser/serve.mjs [port]   (or import { serve } to start it from another script)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.otf': 'font/otf', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json'
};

export function serve(port = 4173) {
  const dist = join(root, 'dist');
  if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ not found: run `npm run build` first');
  const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const matchRedirect = (path) => (config.redirects || []).find((r) => {
    const pattern = '^' + r.source.replace(/\/:path\*$/, '(?:/(.*))').replace(/:[a-z]+/gi, '([^/]+)') + '$';
    return new RegExp(pattern).test(path);
  });

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const redirect = matchRedirect(url.pathname);
    if (redirect) {
      res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination });
      return res.end();
    }
    let file = join(dist, decodeURIComponent(url.pathname));
    if (!file.startsWith(dist)) { res.writeHead(400); return res.end(); }
    if (url.pathname === '/') file = join(dist, 'index.html');
    else if (config.cleanUrls && !extname(url.pathname) && existsSync(`${file}.html`)) file += '.html';
    if (!existsSync(file) || statSync(file).isDirectory()) {
      const notFound = join(dist, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end(existsSync(notFound) ? readFileSync(notFound) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    return res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(Number(port), '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.argv[2] || 4173;
  await serve(port);
  console.log(`Serving dist/ on http://127.0.0.1:${port}/`);
}

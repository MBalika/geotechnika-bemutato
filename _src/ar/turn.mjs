// Bemutató képsor egy modellről (ellenőrzéshez, előzetes videóhoz): node turn.mjs <id> <ki_mappa> <spec.json> [--labels]
// spec.json: [{ az, el, t, fill, lift, zoom }] képkockánként
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require(process.env.PW || 'playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, s) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const [id, out, specFile] = process.argv.slice(2); const lab = process.argv.includes('--labels'); const W = +(process.env.W || 960), H = +(process.env.H || 600);
const list = JSON.parse(fs.readFileSync(specFile, 'utf8')); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/_src/ar/build.html`); await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
for (let i = 0; i < list.length; i += 20) { const r = await page.evaluate(([a, w, h, l, b]) => window.frames(a, w, h, l, b), [id, W, H, list.slice(i, i + 20), lab]);
  r.frames.forEach((u, k) => fs.writeFileSync(path.join(out, 'f_' + String(i + k).padStart(5, '0') + '.jpg'), Buffer.from(u.split(',')[1], 'base64'))); }
if (errs.length) console.log('hibák:', [...new Set(errs)].slice(0, 5).join('\n')); console.log('kész', list.length);
await browser.close(); srv.close();

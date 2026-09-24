// Copies Excalidraw's offline font / asset bundles from node_modules into
// public/excalidraw-assets so the Modern Board works 100% offline (no CDNs).
import { cpSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
// @excalidraw/excalidraw points at dist/dev/index.js via its exports map;
// the package root is two directories above that file.
const entry = createRequire(import.meta.url).resolve('@excalidraw/excalidraw');
const pkgRoot = resolve(dirname(entry), '..', '..');
const publicDir = resolve(root, 'public', 'excalidraw-assets');

const sources = ['dist/dev/fonts', 'dist/prod/fonts', 'dist/dev/data'];
const out = resolve(publicDir, 'fonts');

mkdirSync(publicDir, { recursive: true });
if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let copied = 0;
for (const rel of sources) {
  const src = resolve(pkgRoot, rel);
  if (!existsSync(src)) continue;
  cpSync(src, out, { recursive: true });
  copied++;
}
console.log(`Excalidraw offline assets copied from ${copied} source folder(s) -> public/excalidraw-assets/fonts`);
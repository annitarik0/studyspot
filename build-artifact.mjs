// Writes artifact.html: index.html without the document wrapper, for hosting as a claude.ai Artifact
// (the host adds its own <!doctype>, <html>, <head> and <body>). Run: node build-artifact.mjs
import { readFile, writeFile } from 'node:fs/promises';

const src = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const out = src
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/gi, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<\/?body>\s*/gi, '')
  .replace(/\s*<meta charset[^>]*>/i, '')
  .replace(/\s*<meta name="viewport"[^>]*>/i, '')
  .replace(/\s*<link rel="icon"[^>]*>/i, '')
  .trimStart();
await writeFile(new URL('./artifact.html', import.meta.url), out);
console.log(`artifact.html written (${out.length} bytes)`);

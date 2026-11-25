import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const dist = new URL('dist/', project);
const names = ['index.html', 'style.css', 'shore.css', 'floors.css', 'app.js', 'tour.js', 'photos/brand.png'];
for (const font of (await readdir(new URL('fonts/', dist))).sort()) {
  if (/^(lora|nunito)(\.|-)/.test(font)) names.push('fonts/' + font);
}
for (const photo of (await readdir(new URL('photos/', dist))).sort()) {
  if (photo.endsWith('.webp')) names.push('photos/' + photo);
}
const files = Object.fromEntries(await Promise.all(names.map(async name => [
  '/' + name, (await readFile(new URL(name, dist))).toString('base64'),
])));

const browserSource = await readFile(new URL('app.js', dist), 'utf8');
const roomsEnd = browserSource.indexOf('\nconst photos =');
if (!browserSource.startsWith('const rooms =') || roomsEnd === -1) {
  throw new Error('Room declarations are missing from the browser code');
}
const bot = await readFile(new URL('bot.mjs', import.meta.url), 'utf8');
const ecvi = await readFile(new URL('ecvi.mjs', import.meta.url), 'utf8');
const worker = await readFile(new URL('worker.mjs', import.meta.url), 'utf8');
const output = new URL('server/', dist);
await mkdir(output, { recursive: true });
await writeFile(new URL('index.js', output), [
  browserSource.slice(0, roomsEnd),
  'const embeddedFiles = ' + JSON.stringify(files) + ';',
  bot,
  ecvi,
  worker,
].join('\n\n'));

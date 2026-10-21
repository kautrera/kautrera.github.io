// Downloads the Squarespace CDN images listed in image-manifest.json into public/images.
// Run on your own machine:  npm run fetch-images
import { mkdir, writeFile, access } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(
  await readFile(new URL('./image-manifest.json', import.meta.url), 'utf8')
);
const outDir = new URL('../public/images/', import.meta.url);
await mkdir(outDir, { recursive: true });

let ok = 0;
const failed = [];
for (const [url, name] of Object.entries(manifest)) {
  const dest = new URL(name, outDir);
  try {
    await access(dest);
    ok++;
    continue; // already downloaded
  } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    ok++;
    console.log('saved', name);
  } catch (e) {
    failed.push(`${name} (${e.message})`);
  }
}
console.log(`\n${ok}/${Object.keys(manifest).length} images ready.`);
if (failed.length) console.log('Failed:\n' + failed.join('\n'));

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Protected pages are rendered between gate markers. After the build, that region is inlined with its assets,
// encrypted (PBKDF2 + AES-GCM) and written to sealed/<slug>.json, which is safe to commit. The page keeps only
// the ciphertext and a passcode form. Without the private/ sources (CI), pages render from sealed/ alone.
const START = '<!--gate:start-->';
const END = '<!--gate:end-->';
const ITER = 250000;
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

export default function seal({ base = '' } = {}) {
  return {
    name: 'seal-protected-pages',
    hooks: {
      'astro:build:done': ({ dir, pages }) => {
        const out = fileURLToPath(dir);
        const root = process.cwd();
        for (const { pathname } of pages) {
          const file = join(out, pathname, 'index.html');
          if (!existsSync(file)) continue;
          let html = readFileSync(file, 'utf8');
          const a = html.indexOf(START), b = html.indexOf(END);
          if (a < 0 || b < 0) continue;
          const passcode = process.env.SEAL_PASSCODE;
          if (!passcode) throw new Error(`"${pathname}" is protected. Build with \`npm run seal\` (prompts for the passcode).`);

          let region = html.slice(a + START.length, b);
          const used = new Set();
          const assetRe = new RegExp(`${base}/_astro/[^"'\\s)]+?\\.(?:webp|png|jpg|svg|mp4)`, 'g');
          region = region.replace(assetRe, (url) => {
            const path = join(out, url.slice(base.length));
            used.add(path);
            return `data:${MIME[extname(path)]};base64,${readFileSync(path).toString('base64')}`;
          });

          const salt = randomBytes(16), iv = randomBytes(12);
          const key = pbkdf2Sync(passcode, salt, ITER, 32, 'sha256');
          const cipher = createCipheriv('aes-256-gcm', key, iv);
          const ct = Buffer.concat([cipher.update(region, 'utf8'), cipher.final(), cipher.getAuthTag()]);
          const sealed = { salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64'), iter: ITER };

          const slug = pathname.replace(/^\/|\/$/g, '');
          mkdirSync(join(root, 'sealed'), { recursive: true });
          writeFileSync(join(root, 'sealed', `${slug}.json`), JSON.stringify(sealed));

          html = html.slice(0, a) + html.slice(b + END.length);
          html = html.replace(/(<script type="application\/json" id="gate-data"[^>]*>)[^<]*(<\/script>)/, `$1${JSON.stringify(sealed)}$2`);
          writeFileSync(file, html);
          used.forEach((p) => rmSync(p, { force: true }));
          console.log(`[seal] ${slug}: sealed ${(ct.length / 1048576).toFixed(1)} MB -> sealed/${slug}.json`);
        }
      },
    },
  };
}

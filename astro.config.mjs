import { defineConfig } from 'astro/config';
import rehypeBase from './plugins/rehype-base.mjs';
import seal from './plugins/seal.mjs';

// Served from the user-site root (kautrera.github.io); plugins take the base without a trailing slash.
const base = '';

export default defineConfig({
  site: 'https://kautrera.github.io',
  base: '/',
  integrations: [seal({ base })],
  markdown: { rehypePlugins: [[rehypeBase, { base }]] },
});

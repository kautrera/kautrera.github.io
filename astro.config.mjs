import { defineConfig } from 'astro/config';
import rehypeBase from './plugins/rehype-base.mjs';
import seal from './plugins/seal.mjs';

const base = '/portfolio';

export default defineConfig({
  site: 'https://kautrera.github.io',
  base,
  integrations: [seal({ base })],
  markdown: { rehypePlugins: [[rehypeBase, { base }]] },
});

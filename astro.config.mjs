import { defineConfig } from 'astro/config';
import rehypeBase from './plugins/rehype-base.mjs';

const base = '/portfolio';

export default defineConfig({
  site: 'https://kautrera.github.io',
  base,
  markdown: { rehypePlugins: [[rehypeBase, { base }]] },
});

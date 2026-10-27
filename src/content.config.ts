import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    protected: z.boolean().optional(),
    subtitle: z.string().optional(),
    about: z.array(z.string()).optional(),
    role: z.string().optional(),
    year: z.coerce.number().optional(),
    tools: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

export const collections = { pages };

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seasons = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/seasons" }),
  schema: 
    z.object({
      date: z.date(),
      fbEventLink: z.string().optional(),
      cover: z.string(),
      claim: z.string().optional(),
      bands: z.array(z.string()).optional(),
    }),
});

export const collections = { seasons };

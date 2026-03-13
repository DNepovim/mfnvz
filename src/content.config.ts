import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seasons = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/seasons" }),
  schema: z.object({
    date: z.date(),
    door: z.date(),
    fbEventLink: z.string().optional(),
    cover: z.string(),
    claim: z.string().optional(),
    bands: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url().optional(),
          genre: z.string().optional(),
          foundingDate: z.date().optional(),
          location: z.string().optional(),
          logo: z.string().optional(),
          email: z.string().email().optional(),
          member: z
            .array(
              z.object({ name: z.string(), jobTitle: z.string().optional() }),
            )
            .optional(),
        }),
      )
      .optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const collections = { seasons };

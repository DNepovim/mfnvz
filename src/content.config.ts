import { readdirSync } from 'fs'
import { join } from 'path'
import { defineCollection, z } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'
import { glob } from 'astro/loaders'

const seasons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/seasons' }),
  schema: z.object({
    startDate: z.date(),
    endDate: z.date(),
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
          image: z.string().optional(),
          claim: z.string().optional(),
          description: z.string().optional(),
          member: z
            .array(z.object({ name: z.string(), jobTitle: z.string().optional() }))
            .optional(),
        }),
      )
      .optional(),
    images: z.array(z.string()).optional(),
    galleryUrl: z.string().url().optional(),
    schedule: z
      .array(z.object({ name: z.string(), startDate: z.date(), location: z.string() }))
      .optional(),
  }),
})

const seasonsDir = join(process.cwd(), 'src/content/seasons')

const seasonIds = readdirSync(seasonsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace('.mdx', ''))
  .slice(0, -1)

const galleryCollections = Object.fromEntries(
  seasonIds.map((id) => [
    `gallery${id}`,
    defineCollection({
      loader: cldAssetsLoader({
        limit: 500,
        folder: id,
        tags: true,
      }),
    }),
  ]),
)

export const collections = { seasons, ...galleryCollections }

# Little Fest in a Large Garden

Website for **Little Fest in a Large Garden** — a small annual backyard music festival in Řevnice, Czech Republic. Each summer, music, beer from the local brewery, grilled sausages, and a bonfire.

Built with [Astro](https://astro.build), deployed to [Vercel](https://vercel.com).

## Tech stack

- **Astro 5** — static site generator with SSR via Vercel adapter
- **Tailwind CSS 4** — styling
- **MDX** — content for each festival year (`src/content/seasons/`)
- **Cloudinary** — photo gallery storage and delivery
- **Swup** — page transitions
- **Unpic** — optimized image rendering with LQIP placeholders
- **Vercel OG** — dynamically generated Open Graph images per season

## Project structure

```
src/
├── content/
│   └── seasons/        # One MDX file per year (2023–2026)
├── pages/
│   ├── index.astro     # Current season homepage
│   ├── rocnik/[id]/
│   │   ├── index.astro     # Past season page
│   │   └── obrazky.astro   # Photo gallery for that season
│   └── og/[id].jpg.ts  # OG image generation
├── components/         # Astro components
├── layouts/
│   └── Layout.astro    # Base HTML layout
└── content.config.ts   # Content collections + Cloudinary gallery loaders
```

## Adding a new season

1. Create `src/content/seasons/<year>.mdx` with the required frontmatter:

```yaml
---
startDate: 2027-06-18T18:00:00
endDate: 2027-06-18T23:59:00
door: 2027-06-18T17:00:00
cover: <cloudinary-url>
claim: "..."
bands:
  - name: Band Name
    url: https://...
    genre: Rock
schedule:
  - name: Otevřeme branku
    startDate: 2027-06-18T17:00:00
    location: Branka
---
```

2. Update `src/pages/index.astro` to point to the new year (`getEntry('seasons', '2027')`).
3. Upload gallery photos to Cloudinary under a folder named `<year>`.

## Development

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # Production build → ./dist/
pnpm preview    # Preview production build
```

### Environment variables

| Variable | Description |
| -------- | ----------- |
| `SITE_URL` | Public URL of the site |
| `UMAMI_SITE_ID` | Umami analytics site ID |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

### Other scripts

```sh
pnpm typecheck      # TypeScript check
pnpm lint:fix       # ESLint autofix
pnpm format:write   # Prettier autoformat
pnpm check          # Run all checks (types, lint, format, knip)
```

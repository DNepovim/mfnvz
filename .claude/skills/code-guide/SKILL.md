---
name: code-guide
description: Coding style and conventions for the mfnvz festival site — TypeScript, Astro components, Tailwind 4 theming, MDX season collections, Cloudinary images, and Czech copy. Consult when writing or reviewing code.
---

# Code Guide

Style and pattern reference for the mfnvz codebase (Astro 5 + MDX + Tailwind 4,
deployed on Vercel). Consult before writing or reviewing any code.

---

## Comments

**Write no comments, in any language.** No `//`, no `/* */`, no JSDoc, no
`TODO`/`FIXME`. Prefer clear names and structure instead. If a tool or template
generates comments, remove them before saving. Never add `eslint-disable`
comments — fix the code, or prefix a genuinely-unused binding with `_`.

(`src/pages/og/[id].jpg.ts` carries one pre-existing `eslint-disable-next-line`;
it's a leftover, not a licence to add more.)

---

## TypeScript

- **Arrow functions, never `function` declarations** (`AGENTS.md`)
- Write functional, immutable code
- Do not use `any`
- Avoid type assertions (`as`) — model the types correctly instead. The
  existing `year as '2024'` in `Gallery.astro` and the `as Record<string,
  unknown>` MDX component maps are workarounds for third-party typings, not a
  pattern to copy
- Do not use non-null assertions (`!`) — `noUncheckedIndexedAccess` is on; guard
  or use `??`
- Prefer `const` over `let`; avoid mutation
- Avoid `for` / `for...of` / `for...in`; use `.map`, `.filter`, `.reduce`,
  `.flatMap`, `.toSorted`
- Prefer early returns over nested conditionals
- Use `type` for all type definitions (not `interface`) — lint-enforced
- Use the `type` keyword on import-only lines: `import type { Foo } from '...'`
- Named exports only; avoid default exports
- Always use the `@/` path alias — parent-relative `../` imports are lint-banned
  (sibling `./` imports are fine)

Type-aware lint rules are switched off inside `.astro` files, so logic that
needs real type checking belongs in `src/utils/*.ts`, not in frontmatter.

---

## Astro components

- Declare `type Props` and destructure from `Astro.props`
- Accept `class?: string`, alias it (`class: className`), and compose with
  `class:list={[className, '...']}` — see `A.astro`, `H2.astro`
- Prefer semantic HTML; avoid inline `style` attributes
- Fetch content in the frontmatter with `astro:content` APIs (`getCollection`,
  `getEntry`, `render`) — never read files directly. The one exception is
  `raw.astro`, which deliberately reads `index.mdx` as text
- Icons come from `astro-icon` with the Phosphor set:
  `<Icon name="ph:tree" class="h-6 w-6" />`
- Read env through `astro:env/client` / `astro:env/server` as declared in
  `env.config.ts` — never `process.env` in app code

```astro
---
type Props = {
  year: string
  class?: string
}

const { year, class: className } = Astro.props
---

<section class:list={[className, 'flex flex-col gap-4']}>
  <slot />
</section>
```

---

## Content and routing

Seasons are the whole data model. One MDX file per year in
`src/content/seasons/<year>.mdx`; the Zod schema lives in
`src/content.config.ts` (dates, `cover`, `claim`, `bands[]`, `images[]`,
`schedule[]`, `galleryUrl`, `fbEventLink`).

- **Season number is derived, not stored:** `Number(season.id) - 2022`
- The newest season file is the upcoming edition. `/` reads it by id; past
  seasons are anything with `startDate <= now`
- `src/content.config.ts` also generates one Cloudinary-backed collection per
  season (`gallery<year>`) via `cldAssetsLoader`. It applies `.slice(0, -1)` to
  the season list, so **the upcoming season has no gallery collection** —
  requesting `gallery<newest>` warns at build time and returns nothing
- Adding a frontmatter field means editing the Zod schema in
  `src/content.config.ts`; there is no second schema to keep in sync
- Routes are literal, there is no `routes.ts`: `/`, `/informace`,
  `/rocnik/<year>`, `/og/<year>.jpg`, `/raw`, `/thno`
- Prose that isn't season data lives in `src/content/index.mdx` and is rendered
  through the component map (`h2: H2, h3: H3, p: P, a: A, ul: Ul, img: Img,
  hr: Hr`). Markdown *strings* from frontmatter go through `renderMarkdown`
  (`src/utils/markdown.ts`), which opens external links in a new tab
- Heading anchors come from `slugify` (`src/utils/slug.ts`) — `H2` applies it
  automatically, so in-page links like `[Račte skrolovat](#kdo-tam-bude-hrat)`
  keep working

---

## Images (Cloudinary)

Two tools, and picking the wrong one is the main source of image bugs here.

- **`CldImage`** (`astro-cloudinary`) — for images that should *fill* a fixed
  box: grid thumbnails, tiles, covers. Use `crop="auto"` / `crop="fill"` with
  `gravity="auto"`.
- **`getCldImageUrl`** (`astro-cloudinary/helpers`) + a plain `<img>` — for
  images that must be shown **whole**: the lightbox, OG images, anything where a
  portrait photo has to survive intact. See `Lightbox.astro` and `Cover.astro`.

**Why it matters:** `CldImage` renders through unpic, which writes an inline
`style` of `object-fit:cover; aspect-ratio:<w/h>; width:100%` onto the element.
That inline style beats any `object-contain` Tailwind class, and the fixed
`aspect-ratio` forces every photo into the same box — portrait images get
badly cropped. When you need containment, build the URL with
`crop: 'fit'` and render your own `<img>` with `max-h-full max-w-full
object-contain`.

Always pass `format: 'auto'` and `quality: 'auto'`.

---

## Styling (Tailwind 4)

Tailwind utilities only — no ad-hoc CSS files, no inline `style` for anything
Tailwind can express. Theme tokens live in `src/styles/global.css` under
`@theme`.

- Fonts: `font-head` (liebedoni-outline), `font-head-solid` (liebedoni-solid),
  `font-text` (open-sans, the `<html>` default)
- `tailwindcss-motion` is loaded as a plugin — use its `motion-*` utilities
  rather than hand-rolled keyframes
- Viewport-relative type (`text-[7vw] sm:text-5xl`) is the established way
  headers scale; follow it instead of inventing new breakpoints
- Class order is enforced by `prettier-plugin-tailwindcss`; never hand-sort

---

## Value maps

Do not use `if`/ternary chains or `switch` to select a value from a known set.
Use a module-level constant map instead:

```ts
const LABELS = {
  past: 'proběhlo',
  upcoming: 'chystá se',
} as const satisfies Record<SeasonState, string>

const label = LABELS[state]
```

`as const` preserves literal types, `satisfies` enforces exhaustiveness at
compile time. Never use `Partial<Record<string, ...>>` — it silently accepts
unknown keys and defeats the check. Use `switch` only for executing side effects
per variant, never for computing a value.

---

## Type narrowing

Use type guards from `narrowland` instead of manual comparisons:

```ts
import { isDefined, isNonEmptyArray, isNotNull, isOneOf } from 'narrowland'
```

| Pattern to replace         | narrowland equivalent     |
| -------------------------- | ------------------------- |
| `a === 'x' \|\| a === 'y'` | `isOneOf(a, ['x', 'y'])`  |
| `a !== 'x' && a !== 'y'`   | `!isOneOf(a, ['x', 'y'])` |
| `arr.length > 0`           | `isNonEmptyArray(arr)`    |
| `arr.length === 0`         | `isEmptyArray(arr)`       |
| `value !== null`           | `isNotNull(value)`        |
| `value !== undefined`      | `isDefined(value)`        |

`index.astro` guards the gallery with `isNonEmptyArray(galleryImages)` — follow
that. Single boolean checks (`if (!post)`) are fine as-is; reach for narrowland
when it replaces a multi-part check or adds semantic clarity.

---

## Client-side scripts

Interactivity is plain `<script>` blocks inside components — there is no UI
framework in this repo, and `embla-carousel` is the only client library you
import directly. Keep
them small, query by `data-*` attributes, and communicate between components
with `CustomEvent` on `document` (`Gallery.astro` → `gallery:open` →
`Lightbox.astro`) rather than shared globals.

Page navigation runs through `@swup/astro`, so don't assume a full reload
between routes.

---

## Content Security Policy

`vercel.json` sets a strict CSP for every route. Anything loaded from a new
external origin — a script, a font, an image host, an analytics endpoint — must
be added to the matching directive there. The dev server doesn't apply these
headers, so a missing entry only breaks in production. Current allowances:
Typekit (styles, fonts), Cloudinary (images), Vercel Analytics and Umami
(scripts, connect).

---

## Czech typography and copy

- All user-facing copy is Czech, including `aria-label`s where a screen-reader
  user would hear them
- Dates are formatted with `toLocaleDateString('cs-CZ')`
- The site voice is informal and playful (`Zatím si umyjte půllitry.`) — match
  the surrounding tone rather than writing neutral marketing prose

---

## Accessibility

- ESLint runs `jsx-a11y-strict` on `.astro` — it fails the lint run, not warns
- Use appropriate `aria-*` attributes on interactive UI
- Keep keyboard interaction working for the lightbox dialog (Escape, arrows) and
  manage focus deliberately — see `Lightbox.astro`

---

## Checks

After every task run the **`check`** skill (types, lint, Prettier, Knip) and fix
everything in the files you touched. Note that `pnpm check` exits 0 even when
things fail — the skill explains why and what to run instead. There is no test
framework; verify behaviour with `pnpm build` or the **`run`** skill.

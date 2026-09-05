---
name: check
description: Run the full static-check suite for the mfnvz site — ESLint, Prettier, TypeScript, and Knip — and fix any failures. Use when asked to check, verify, or QA the code (e.g. "run the checks", "is it clean?", before committing/deploying).
---

# Static checks (mfnvz)

Run all four checks, then fix everything you touched until they pass clean.

## Do not trust `pnpm check`

`package.json` defines it as:

```
pnpm typecheck & pnpm format:check & pnpm lint:check & knip
```

The `&` separators background the first three, so the script's exit code is
**knip's alone**. Knip is currently clean, which means `pnpm check` exits `0`
even with two dozen type and lint errors in the tree — verified. The output is
also interleaved from four concurrent processes.

**Always run the four commands individually** and read each result.

## The four checks

| Check     | Command             | Auto-fix            |
| --------- | ------------------- | ------------------- |
| Types     | `pnpm typecheck`    | manual              |
| Lint      | `pnpm lint:check`   | `pnpm lint:fix`     |
| Format    | `pnpm format:check` | `pnpm format:write` |
| Dead code | `pnpm knip`         | manual              |

## Prettier globs don't line up

- `format:check` globs `**/*.{ts,tsx,js,cjs,json,svg}` — the whole repo.
- `format:write` globs `src/**/*.{ts,tsx,js,cjs,json,svg}` — `src` only.

So `format:write` cannot fix the root config files that `format:check` flags
(`astro.config.ts`, `env.config.ts`, `eslint.config.js`, `prettier.config.js`,
`tailwind.config.ts`). Fix those explicitly:

```bash
pnpm exec prettier --write astro.config.ts env.config.ts
```

`.astro` files are in neither glob — they're linted but never format-checked.
`prettier-plugin-astro` is installed, so format one you touched explicitly:

```bash
pnpm exec prettier --write src/components/Foo.astro
```

Don't run that repo-wide; most `.astro` files have drift and you'd ship an
unrelated diff. `.prettierignore` excludes `**/*.svg`.

## How to fix

1. **TypeScript** — `noUncheckedIndexedAccess` is on, so guard or `??` index
   accesses instead of asserting with `!`. If content-collection types look
   stale, run `pnpm astro sync` to regenerate `.astro/types.d.ts`, then re-run.
2. **ESLint** — `pnpm lint:fix` handles the auto-fixable rules; hand-fix the
   rest. Config is `eslint.config.js` (`strictTypeChecked` +
   `stylisticTypeChecked` + sonarjs + astro + `jsx-a11y-strict`). Type-aware
   rules are **disabled** on `.astro` files, so a `.ts` file gets stricter
   treatment than the same code in a component.
   - Use the `@/` alias — parent-relative (`../`) imports are lint-banned;
     sibling `./` is fine.
   - `type` over `interface`.
   - Never add `eslint-disable` comments — fix the code, or prefix a genuinely
     unused binding with `_`.
3. **Prettier** — never hand-format; run the command (no semicolons, single
   quotes, width 90, import groups sorted by
   `@ianvs/prettier-plugin-sort-imports`, classes sorted by
   `prettier-plugin-tailwindcss`).
4. **Knip** — `knip.config.ts` treats `src/pages/**` and `src/content/**/*.mdx`
   as entries. Resolve findings by deleting unused files, un-`export`ing
   internal-only symbols, or removing unused deps. A dep used implicitly rather
   than imported (`@iconify-json/ph`, `eslint-plugin-jsx-a11y`) belongs in
   `ignoreDependencies`, not in the bin.

## Known baseline (2026-09-05)

The tree is **not** green. Pre-existing failures, none of them yours:

- **Types (3)** — all in `src/pages/og/[id].jpg.ts`: two `ArrayBuffer | undefined`
  assignments (63, 71) and a `Buffer` → `BodyInit` mismatch (175).
- **Lint (21)** — non-null assertions in `BandCarousel.astro` (4) and
  `Lightbox.astro` (2); unused `FacebookIcon` import in `Footer.astro`; unused
  `Schedule` import in `rocnik/[id]/index.astro`; unused `seasonNumber` in
  `raw.astro`; `sonarjs/slow-regex` in `H2.astro` and `raw.astro` (2); seven
  findings in `src/utils/schema.ts`.
- **Format (7)** — `astro.config.ts`, `env.config.ts`, `eslint.config.js`,
  `prettier.config.js`, `tailwind.config.ts`, `src/content.config.ts`,
  `src/utils/schema.ts`.
- **Knip** — clean.

There is also one pre-existing `eslint-disable-next-line` in
`src/pages/og/[id].jpg.ts:163`.

Re-measure this list rather than trusting it if it looks stale, and update this
section when you clear items.

## Done criterion

**No new findings in the files you touched**, and the counts above unchanged or
lower. Don't fix unrelated pre-existing errors unless asked — say what's left.
Report a short summary of what each check found and what you changed.

There is no test framework in this repo — don't add test files or assume one
exists. To verify behaviour, run `pnpm build` (it catches content-schema and
render errors the four checks miss) or the **`run`** skill.

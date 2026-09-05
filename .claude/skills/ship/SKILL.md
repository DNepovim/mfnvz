---
name: ship
description: Ship the current work — first run the `check` suite, then (default) commit on a new branch and open a GitHub PR, or (`ship prod`) commit and push straight to main. Use when finishing a piece of work and you want it committed / PR'd / shipped. Argument, `prod`, controls the mode.
---

# Ship

Two modes:

- **`ship`** (no argument) → ask the user whether to open a branch + PR or commit
  directly to `main`.
- **`ship prod`** → skip the question and commit directly to `main`.

Both start by gating on the checks and proposing Conventional Commit messages
for confirmation. **Never commit, push, or open a PR without the user's explicit
confirmation of the message(s) — and, for the branch flow, the branch name.**

## Step 0 — Gate on checks (both modes)

Invoke the **`check`** skill (types, lint, Prettier, Knip). Remember that
`pnpm check` exits 0 even when things fail, so the skill's individual commands
are the real gate.

The tree has a known baseline of pre-existing failures (see the `check` skill).
The bar is **no new findings in the files being shipped** — don't block on
errors that were already there, but don't hide them either: list them in the
summary. If something you introduced can't be made green, **stop** and report.

Then look at what will ship: `git status --short` and `git diff` (staged +
unstaged). If the tree is clean, say there's nothing to ship and stop.

## Step 0b — Build gate (both modes)

There is no test suite, so `pnpm build` is the only end-to-end verification.
Run it whenever the change touches components, pages, `src/content/`, or
`src/content.config.ts`. It catches content-schema violations and render errors
the static checks miss. A failing build never ships.

Content lives in `src/content/seasons/*.mdx` and `src/content/index.mdx` and is
hand-edited — there is no CMS and no concurrent editor to race with. Photos live
in Cloudinary, so an image change may be nothing but a URL in frontmatter.

## Step 0c — Choose ship mode (only when invoked as plain `ship`)

Ask the user using **`AskUserQuestion`**:

- **"Branch + PR"** — create a new branch, commit, push, open a GitHub PR. (Recommended)
- **"Commit to main"** — commit and push directly to `main` (same as `ship prod`).

Use the answer to determine which Step 2 path to follow.

## Step 1 — Propose Conventional Commit message(s) (both modes)

Read the diff and propose commit message(s) following **Conventional Commits
v1.0.0** (https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- **types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, `revert`.
- `feat` → MINOR, `fix` → PATCH. Breaking change → append `!` after type/scope
  **and/or** a `BREAKING CHANGE:` footer.
- Description: imperative mood, lowercase, no trailing period, concise.
- Scope is optional and in parentheses, e.g. `feat(gallery): …`.

If the working tree contains **logically separate** changes, propose **multiple
commits** (each a coherent Conventional Commit with the files it covers) rather
than one catch-all. Otherwise propose a single commit.

Present the proposed message(s) (and, in branch mode, the branch name) using
**`AskUserQuestion`** with these choices:

- **"Ship it"** — proceed as-is (Recommended)
- **"Edit message"** — user will type a replacement; apply it and ship
- **"Cancel"** — stop, do not commit

Only continue once the user picks "Ship it" or provides an edited message.
Do **not** ask in plain text — always use `AskUserQuestion` so the session
stays unblocked.

Every commit message must end with the footers the harness specifies for the
current session:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: <the session URL from the environment>
```

## Step 2 — Ship

### Default (`ship`, no arg): branch + PR

1. Suggest a branch name `<type>/<kebab-summary>` (e.g. `feat/informace-page`,
   `fix/lightbox-crop`) derived from the change. Include it in the Step 1
   confirmation prompt.
2. If on the default branch (`main`), create and switch to the new branch
   (`git checkout -b <branch>`) — this carries the uncommitted changes with it.
3. Commit the confirmed message(s) (stage per-commit if splitting).
4. Push: `git push -u origin <branch>`.
5. Open the PR with `gh pr create --base main --head <branch> --title "<conventional title>" --body "<short summary of what & why>"`.
6. Report the PR URL, and note that Vercel will build a preview deployment for
   the branch.

### `ship prod`: commit + push to main

1. Ensure you're on `main` (or check it out).
2. Commit the confirmed message(s).
3. `git push origin main`.
4. **Note to the user:** `main` is the production branch on Vercel
   (`@astrojs/vercel` adapter), so pushing `main` deploys the production site.

## Notes

- Remote is `git@github.com:DNepovim/mfnvz.git`.
- Use `gh` for the PR; if `gh` isn't authenticated, tell the user to run
  `gh auth login` (as a `! gh auth login` prompt) rather than failing silently.
- Don't touch unrelated files or amend history the user didn't ask about.
- Never commit `.env`, Cloudinary secrets (`CLOUDINARY_API_SECRET`), or the
  Umami site id.
- `dist/`, `.astro/` and `.vercel/` are build output and already gitignored —
  never force-add them.
- Adding an external script, font, or image host means updating the CSP in
  `vercel.json`, or it will be blocked in production but fine in dev.

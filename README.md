# UBIKParallax

**Parallax** — Observations registered from outside the system — all temporal intervals accessible, none ranked, none sequential.

A personal Digital Garden built with React + Tailwind CSS, designed in a Bauhaus-inspired geometric rationalist style. Notes are stored as Obsidian-compatible Markdown files and automatically published to GitHub Pages on every push.

## Architecture

```
vault/              ← Your Obsidian notes (Markdown files)
vault/.assets.json  ← CDN URLs for embedded images/PDFs
scripts/
  build-notes.mjs   ← Parses vault/ → client/src/lib/notes.ts
client/
  src/
    pages/          ← React page components
    components/     ← Reusable UI components
    lib/notes.ts    ← Auto-generated from vault/ (DO NOT EDIT)
.github/
  workflows/
    deploy.yml      ← GitHub Actions: build + deploy to Pages
```

## How It Works

1. You add/edit `.md` files in the `vault/` directory
2. You push to `main`
3. GitHub Actions runs `build-notes.mjs` to parse your notes
4. Vite builds the static site
5. The site deploys to GitHub Pages automatically

## Adding Notes

### Simple Markdown Note

Create a file in `vault/` (any subdirectory works):

```markdown
---
title: My New Note
category: Philosophy
tags: [consciousness, emergence, complexity]
date: 2026-03-01
type: markdown
---

Your note content here. Use [[Wikilinks]] to link to other notes.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | No | Display title (inferred from filename if missing) |
| `category` | No | Grouping category (inferred from parent folder) |
| `tags` | No | Array of tags (inferred from title words if missing) |
| `date` | No | ISO date string (inferred from filename or file date) |
| `type` | No | `markdown`, `journal`, or `quote` |
| `excerpt` | No | Custom excerpt (auto-generated if missing) |

### Wikilinks

Link to other notes using `[[Note Title]]` syntax. The build script resolves these to navigable links.

### Journal Entries with Scanned Pages

For handwritten journal pages:

1. Convert your PDF to images and upload to a CDN
2. Add the CDN URLs to `vault/.assets.json`:

```json
{
  "journalImages": {
    "your-note-slug": [
      "https://cdn.example.com/page-1.png",
      "https://cdn.example.com/page-2.png"
    ]
  }
}
```

3. Create a journal note that references the PDF:

```markdown
---
title: Journal — March 2026
category: Journal
tags: [personal, reflection]
date: 2026-03-01
type: journal
---
![[My-Journal.pdf]]
```

## Obsidian Git Integration

To auto-sync your Obsidian vault to this repo:

1. Install the **Obsidian Git** community plugin
2. Set the vault path to the `vault/` directory of this repo
3. Configure auto-push on save (or manual push)
4. Every push triggers a rebuild and deploy

## Local Development

```bash
pnpm install
node scripts/build-notes.mjs
pnpm dev
```

## Manual Deploy

The GitHub Action handles deployment automatically. To trigger manually:

1. Go to **Actions** → **Build & Deploy Digital Garden**
2. Click **Run workflow**

## Setup GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Build and deployment**, select **GitHub Actions** as the source
3. The site will be available at `https://<username>.github.io/UBIKParallax/`

## License

Personal archive. All rights reserved.

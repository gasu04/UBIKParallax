#!/usr/bin/env node
/**
 * build-notes.mjs — Obsidian Vault → notes.ts generator
 * 
 * Reads all .md files from the vault/ directory, parses frontmatter,
 * extracts wikilinks, and generates client/src/lib/notes.ts
 * 
 * Supports:
 *   - YAML frontmatter (title, date, tags, category, type)
 *   - Wikilinks: [[Note Title]] and [[Note Title|Display Text]]
 *   - Embedded files: ![[filename.pdf]] or ![[image.png]]
 *   - Auto-inferred metadata when frontmatter is missing
 *   - Journal images from a configurable CDN mapping
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VAULT_DIR = path.resolve(ROOT, 'vault');
const OUTPUT = path.resolve(ROOT, 'client/src/lib/notes.ts');

// ─── Configuration ──────────────────────────────────────────────
// Map embedded file references to CDN URLs (for PDFs converted to images, etc.)
// Edit this file to add your own mappings
const ASSETS_CONFIG_PATH = path.resolve(ROOT, 'vault/.assets.json');

function loadAssetsConfig() {
  if (fs.existsSync(ASSETS_CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(ASSETS_CONFIG_PATH, 'utf-8'));
    } catch (e) {
      console.warn('⚠ Could not parse .assets.json:', e.message);
    }
  }
  return {};
}

// ─── Frontmatter Parser ─────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  for (const line of raw.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Handle YAML arrays: [a, b, c] or - a style
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    frontmatter[key] = val;
  }

  return { frontmatter, body };
}

// ─── Wikilink Extractor ─────────────────────────────────────────
function extractWikilinks(body) {
  const links = [];
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let m;
  while ((m = regex.exec(body)) !== null) {
    const target = m[1].trim();
    // Skip file embeds (images, pdfs)
    if (/\.(png|jpg|jpeg|gif|svg|pdf|webp|mp4|mp3)$/i.test(target)) continue;
    if (!links.includes(target)) links.push(target);
  }
  return links;
}

// ─── Embedded File Extractor ────────────────────────────────────
function extractEmbeds(body) {
  const embeds = [];
  const regex = /!\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = regex.exec(body)) !== null) {
    embeds.push(m[1].trim());
  }
  return embeds;
}

// ─── Slug Generator ─────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Title Inference ────────────────────────────────────────────
function inferTitle(filename, body) {
  // Try first H1 or H2 in body
  const headingMatch = body.match(/^#{1,2}\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();
  // Fall back to filename without extension
  return filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
}

// ─── Category Inference ─────────────────────────────────────────
function inferCategory(filePath, body, embeds) {
  // Check parent directory name
  const dir = path.basename(path.dirname(filePath));
  const dirLower = dir.toLowerCase();
  if (['science', 'mathematics', 'math', 'physics'].includes(dirLower)) return 'Mathematics';
  if (['philosophy', 'ethics', 'metaphysics'].includes(dirLower)) return 'Philosophy';
  if (['journal', 'journals', 'daily', 'diary'].includes(dirLower)) return 'Journal';
  if (['connections', 'ideas', 'notes'].includes(dirLower)) return 'Connections';
  if (['quotes', 'quote'].includes(dirLower)) return 'Philosophy';

  // Check if it's a journal (date-like filename or embedded PDF)
  const filename = path.basename(filePath);
  if (/^\d{4}-\d{2}-\d{2}/.test(filename)) return 'Journal';
  if (embeds.some(e => /\.pdf$/i.test(e))) return 'Journal';

  // Check if it's a quote
  if (body.startsWith('"') || body.startsWith('>')) return 'Philosophy';

  // Default
  return 'Uncategorized';
}

// ─── Type Inference ─────────────────────────────────────────────
function inferType(category, body, embeds) {
  if (category === 'Journal') return 'journal';
  // Short content that starts with a quote
  const stripped = body.replace(/^#+\s+.+$/gm, '').trim();
  if ((stripped.startsWith('"') || stripped.startsWith('>')) && stripped.length < 1000) return 'quote';
  return 'markdown';
}

// ─── Date Inference ─────────────────────────────────────────────
function inferDate(filename, filePath) {
  // Try filename pattern: YYYY-MM-DD
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return dateMatch[1];
  // Try from embedded file: Doc-MM-DD-YYYY
  const docMatch = filename.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (docMatch) return `${docMatch[3]}-${docMatch[1]}-${docMatch[2]}`;
  // Fall back to file modification time
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// ─── Tag Inference ──────────────────────────────────────────────
function inferTags(body, title) {
  // Extract #hashtags from body
  const hashTags = [];
  const tagRegex = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_-]*)/g;
  let m;
  while ((m = tagRegex.exec(body)) !== null) {
    // Skip markdown headings (## etc.)
    if (m[0].trimStart().startsWith('##')) continue;
    hashTags.push(m[1].toLowerCase());
  }
  if (hashTags.length > 0) return [...new Set(hashTags)];

  // Auto-generate from title words (filter common words)
  const stopWords = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is', 'was', 'are', 'by', 'from', 'with']);
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .map(w => w.replace(/[^a-z0-9-]/g, ''))
    .filter(Boolean)
    .slice(0, 5);
}

// ─── Excerpt Generator ──────────────────────────────────────────
function generateExcerpt(body, maxLen = 180) {
  // Strip markdown, wikilinks, embeds
  const clean = body
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/!\[\[[^\]]+\]\]/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => display || target)
    .replace(/^#+\s+.+$/gm, '')
    .replace(/[*_`~>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

// ─── Clean Body for Display ─────────────────────────────────────
function cleanBody(body) {
  // Remove embed syntax but keep the rest
  return body
    .replace(/!\[\[([^\]]+)\]\]/g, '')  // remove embeds (handled separately)
    .trim();
}

// ─── Main Build ─────────────────────────────────────────────────
function collectMarkdownFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith('.')) continue;
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
      files.push(fullPath);
    }
  }
  return files;
}

function build() {
  console.log('🌱 Building notes from vault/...\n');

  const assetsConfig = loadAssetsConfig();
  const journalImages = assetsConfig.journalImages || {};
  const imageMap = assetsConfig.images || {};

  const mdFiles = collectMarkdownFiles(VAULT_DIR);
  if (mdFiles.length === 0) {
    console.warn('⚠ No .md files found in vault/. Creating empty notes module.');
  }

  console.log(`  Found ${mdFiles.length} markdown file(s)\n`);

  // First pass: parse all notes
  const parsedNotes = [];
  for (const filePath of mdFiles) {
    const filename = path.basename(filePath);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(raw);
    const embeds = extractEmbeds(raw);
    const wikilinks = extractWikilinks(body);

    const title = frontmatter.title || inferTitle(filename, body);
    const slug = slugify(title);
    const category = frontmatter.category || inferCategory(filePath, body, embeds);
    const type = frontmatter.type || inferType(category, body, embeds);
    const date = frontmatter.date || inferDate(filename, filePath);
    const excerpt = frontmatter.excerpt || generateExcerpt(body);

    let tags;
    if (frontmatter.tags) {
      tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
    } else {
      tags = inferTags(body, title);
    }

    // Resolve journal images from embeds
    let noteJournalImages = undefined;
    for (const embed of embeds) {
      if (journalImages[embed]) {
        noteJournalImages = journalImages[embed];
        break;
      }
    }
    // Also check by slug/title
    if (!noteJournalImages && journalImages[slug]) {
      noteJournalImages = journalImages[slug];
    }

    const cleanContent = cleanBody(body);

    parsedNotes.push({
      slug,
      title,
      category,
      tags,
      date,
      excerpt,
      content: cleanContent,
      links: wikilinks,
      type,
      journalImages: noteJournalImages,
    });

    console.log(`  ✓ ${title} [${category}] (${tags.join(', ')})`);
  }

  // Sort by date descending
  parsedNotes.sort((a, b) => b.date.localeCompare(a.date));

  // Second pass: resolve link titles to ensure they reference actual notes
  const titleSet = new Set(parsedNotes.map(n => n.title));

  // Generate the TypeScript module
  const tsContent = generateTypeScript(parsedNotes);

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, tsContent, 'utf-8');

  console.log(`\n✅ Generated ${OUTPUT}`);
  console.log(`   ${parsedNotes.length} notes, ${new Set(parsedNotes.flatMap(n => n.tags)).size} unique tags`);
}

// ─── TypeScript Generator ───────────────────────────────────────
function generateTypeScript(notes) {
  const escapeTS = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

  let ts = `/*
 * Notes data — Auto-generated by build-notes.mjs
 * DO NOT EDIT MANUALLY — run: node scripts/build-notes.mjs
 * Generated: ${new Date().toISOString()}
 */

export interface Note {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  excerpt: string;
  content: string;
  links: string[];
  type: 'markdown' | 'journal' | 'quote';
  journalImages?: string[];
}

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  connections: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export const notes: Note[] = [\n`;

  for (const note of notes) {
    ts += `  {\n`;
    ts += `    slug: "${note.slug}",\n`;
    ts += `    title: "${escapeTS(note.title)}",\n`;
    ts += `    category: "${escapeTS(note.category)}",\n`;
    ts += `    tags: [${note.tags.map(t => `"${escapeTS(t)}"`).join(', ')}],\n`;
    ts += `    date: "${note.date}",\n`;
    ts += `    excerpt: \`${escapeTS(note.excerpt)}\`,\n`;
    ts += `    type: "${note.type}",\n`;
    ts += `    links: [${note.links.map(l => `"${escapeTS(l)}"`).join(', ')}],\n`;
    if (note.journalImages) {
      ts += `    journalImages: [\n`;
      for (const img of note.journalImages) {
        ts += `      "${img}",\n`;
      }
      ts += `    ],\n`;
    }
    ts += `    content: \`${escapeTS(note.content)}\`,\n`;
    ts += `  },\n`;
  }

  ts += `];

// Derived data
export const notesBySlug = new Map(notes.map(n => [n.slug, n]));
export const notesByTitle = new Map(notes.map(n => [n.title, n]));

export const allTags: string[] = Array.from(new Set(notes.flatMap(n => n.tags))).sort();
export const categories = Array.from(new Set(notes.map(n => n.category))).sort();

// Resolve a wikilink title to a slug
export function resolveWikilink(title: string): string | null {
  const note = notesByTitle.get(title);
  if (note) return note.slug;
  const allNotes = Array.from(notesByTitle.entries());
  for (const [t, n] of allNotes) {
    if (t.toLowerCase() === title.toLowerCase()) return n.slug;
  }
  return null;
}

// Get notes by category
export function getNotesByCategory(category: string): Note[] {
  return notes.filter(n => n.category === category);
}

// Get notes by tag
export function getNotesByTag(tag: string): Note[] {
  return notes.filter(n => n.tags.includes(tag));
}

// Get tag statistics
export function getTagStats(): Map<string, number> {
  const stats = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      stats.set(tag, (stats.get(tag) || 0) + 1);
    }
  }
  return stats;
}

// Get backlinks for a note
export function getBacklinks(slug: string): Note[] {
  const note = notesBySlug.get(slug);
  if (!note) return [];
  return notes.filter(n => n.slug !== slug && n.links.includes(note.title));
}

// Build graph data for visualization
export function getGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Create nodes
  for (const note of notes) {
    nodeMap.set(note.slug, {
      id: note.slug,
      title: note.title,
      category: note.category,
      connections: 0,
    });
  }

  // Create edges from wikilinks
  for (const note of notes) {
    for (const linkTitle of note.links) {
      const target = notes.find((n: Note) => n.title === linkTitle);
      if (target && target.slug !== note.slug) {
        edges.push({ source: note.slug, target: target.slug });
        const srcNode = nodeMap.get(note.slug);
        const tgtNode = nodeMap.get(target.slug);
        if (srcNode) srcNode.connections++;
        if (tgtNode) tgtNode.connections++;
      }
    }
  }

  // Also create edges from shared tags (for notes without explicit links)
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const shared = notes[i].tags.filter((t: string) => notes[j].tags.includes(t));
      if (shared.length >= 2) {
        const existing = edges.find(
          e => (e.source === notes[i].slug && e.target === notes[j].slug) ||
               (e.source === notes[j].slug && e.target === notes[i].slug)
        );
        if (!existing) {
          edges.push({ source: notes[i].slug, target: notes[j].slug });
          const srcNode = nodeMap.get(notes[i].slug);
          const tgtNode = nodeMap.get(notes[j].slug);
          if (srcNode) srcNode.connections++;
          if (tgtNode) tgtNode.connections++;
        }
      }
    }
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}

// Search result with context snippet
export interface SearchResult {
  note: Note;
  snippet: string;
  matchField: string;
}

function extractSnippet(text: string, query: string, radius: number = 60): string {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return "";
  let start = Math.max(0, idx - radius);
  let end = Math.min(text.length, idx + q.length + radius);
  if (start > 0) {
    const spaceIdx = text.indexOf(' ', start);
    if (spaceIdx !== -1 && spaceIdx < idx) start = spaceIdx + 1;
  }
  if (end < text.length) {
    const spaceIdx = text.lastIndexOf(' ', end);
    if (spaceIdx > idx + q.length) end = spaceIdx;
  }
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end) + suffix;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\\[\\[([^\\]|]+)(\\|[^\\]]+)?\\]\\]/g, '$1')
    .replace(/[#*>\`_~\\-]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

export function searchNotes(query: string): Note[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q)) ||
    n.excerpt.toLowerCase().includes(q) ||
    n.category.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  );
}

export function searchNotesWithContext(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  for (const note of notes) {
    let matchField = "";
    let snippet = "";
    if (note.title.toLowerCase().includes(q)) {
      matchField = "title";
      snippet = note.excerpt;
    } else if (note.tags.some(t => t.toLowerCase().includes(q))) {
      matchField = "tag";
      const matchedTag = note.tags.find(t => t.toLowerCase().includes(q));
      snippet = \`Tag: \${matchedTag} \u2014 \${note.excerpt}\`;
    } else {
      const plainContent = stripMarkdown(note.content);
      if (plainContent.toLowerCase().includes(q)) {
        matchField = "content";
        snippet = extractSnippet(plainContent, query);
      } else if (note.excerpt.toLowerCase().includes(q)) {
        matchField = "excerpt";
        snippet = note.excerpt;
      }
    }
    if (matchField) {
      results.push({ note, snippet, matchField });
    }
  }
  return results;
}
`;

  return ts;
}

// Run
build();

/*
 * BrowsePage — Catalog of all notes with tag filtering
 * Bauhaus: systematic, grid-based, monospaced
 */

import { useState } from "react";
import { Link } from "wouter";
import { notes, allTags, categories } from "@/lib/notes";
import { ArrowRight } from "lucide-react";
import TagPill from "@/components/TagPill";

const categoryMarker: Record<string, string> = {
  Mathematics: "marker-circle",
  Philosophy: "marker-square",
  Journal: "marker-triangle",
};

export default function BrowsePage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = notes.filter(n => {
    if (activeTag && !n.tags.includes(activeTag)) return false;
    if (activeCategory && n.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-2xl lg:text-3xl font-bold text-[oklch(0.12_0_0)] mb-2">
          CATALOG
        </h1>
        <div className="bauhaus-rule-red w-16 mb-4" />
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-xs text-[oklch(0.50_0_0)] max-w-md">
          All observations, filterable by category and tag.
        </p>
      </div>

      <div className="bauhaus-rule" />

      {/* Filters */}
      <div className="px-8 lg:px-16 py-6 bg-[oklch(0.96_0.003_90)] border-b border-[oklch(0.12_0_0/0.10)]">
        {/* Categories */}
        <div className="mb-4">
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-[9px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mr-4">
            Category
          </span>
          <button
            onClick={() => setActiveCategory(null)}
            className={`mr-3 text-xs transition-colors ${
              !activeCategory ? 'text-[oklch(0.55_0.22_25)] font-medium' : 'text-[oklch(0.50_0_0)] hover:text-[oklch(0.12_0_0)]'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`mr-3 text-xs transition-colors inline-flex items-center gap-1.5 ${
                activeCategory === cat ? 'text-[oklch(0.55_0.22_25)] font-medium' : 'text-[oklch(0.50_0_0)] hover:text-[oklch(0.12_0_0)]'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className={categoryMarker[cat] || 'marker-circle'} />
              {cat}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div>
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-[9px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mr-4">
            Tags
          </span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`tag-pill ${activeTag === tag ? '!bg-[oklch(0.12_0_0)] !text-[oklch(0.98_0.005_90)] !border-[oklch(0.12_0_0)]' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {activeTag && (
            <Link href={`/tags/${encodeURIComponent(activeTag)}`}
                  className="inline-flex items-center gap-1 ml-3 text-[10px] text-[oklch(0.55_0.22_25)] hover:underline"
                  style={{ fontFamily: 'var(--font-mono)' }}>
              View all "{activeTag}" → 
            </Link>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-8 lg:px-16 py-8">
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-[10px] text-[oklch(0.50_0_0)] mb-6">
          {filtered.length} of {notes.length} observations
        </p>

        <div className="space-y-0">
          {filtered.map((note, i) => (
            <Link
              key={note.slug}
              href={`/note/${note.slug}`}
              className="group block border-b border-[oklch(0.12_0_0/0.10)] py-4 hover:bg-[oklch(0.12_0_0/0.03)] transition-colors px-2 -mx-2"
            >
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-display)' }}
                      className="text-2xl font-light text-[oklch(0.85_0_0)] w-10 shrink-0 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={categoryMarker[note.category] || 'marker-circle'} />
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontFamily: 'var(--font-display)' }}
                      className="text-base font-semibold text-[oklch(0.12_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors">
                    {note.title}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)' }}
                        className="text-[10px] text-[oklch(0.55_0_0)]">
                    {note.category} — {note.date}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[oklch(0.70_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

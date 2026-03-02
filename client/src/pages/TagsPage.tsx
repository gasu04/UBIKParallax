/*
 * TagsPage — Tag-based categorization view
 * Bauhaus "Geometric Rationalism" — systematic, monospaced, geometric
 * Shows all tags as a visual index, with notes grouped under each tag
 */

import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import { notes, allTags, getTagStats, getNotesByTag } from "@/lib/notes";
import { ArrowRight, ArrowLeft, Tag, Hash } from "lucide-react";

const categoryMarker: Record<string, string> = {
  Mathematics: "marker-circle",
  Philosophy: "marker-square",
  Journal: "marker-triangle",
};

export default function TagsPage() {
  const params = useParams<{ tag?: string }>();
  const activeTag = params.tag ? decodeURIComponent(params.tag) : null;
  const tagStats = useMemo(() => getTagStats(), []);

  // Sort tags by count (descending), then alphabetically
  const sortedTags = useMemo(() => {
    return [...allTags].sort((a, b) => {
      const countDiff = (tagStats.get(b) || 0) - (tagStats.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [tagStats]);

  // If a specific tag is selected, show its notes
  if (activeTag) {
    return <TagDetail tag={activeTag} />;
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-5 h-5 text-[oklch(0.55_0.22_25)]" />
          <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl lg:text-3xl font-bold text-[oklch(0.12_0_0)]">
            TAGS
          </h1>
        </div>
        <div className="bauhaus-rule-red w-16 mb-4" />
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-xs text-[oklch(0.50_0_0)] max-w-md">
          All observations indexed by tag. Select a tag to see related notes.
        </p>
      </div>

      <div className="bauhaus-rule" />

      {/* Tag cloud / grid */}
      <div className="px-8 lg:px-16 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedTags.map(tag => {
            const count = tagStats.get(tag) || 0;
            // Scale visual weight by count
            const isHeavy = count >= 2;
            return (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className={`group block border-2 transition-all hover:border-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.04)] ${
                  isHeavy
                    ? "border-[oklch(0.12_0_0)] bg-[oklch(0.12_0_0/0.02)]"
                    : "border-[oklch(0.12_0_0/0.15)]"
                } p-4`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Hash className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isHeavy ? "text-[oklch(0.55_0.22_25)]" : "text-[oklch(0.60_0_0)]"
                  }`} />
                  <span
                    style={{ fontFamily: 'var(--font-display)' }}
                    className={`text-xl font-light leading-none ${
                      isHeavy ? "text-[oklch(0.12_0_0)]" : "text-[oklch(0.70_0_0)]"
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p
                  style={{ fontFamily: 'var(--font-mono)' }}
                  className={`text-sm group-hover:text-[oklch(0.55_0.22_25)] transition-colors ${
                    isHeavy ? "text-[oklch(0.12_0_0)] font-medium" : "text-[oklch(0.40_0_0)]"
                  }`}
                >
                  {tag}
                </p>
                <p
                  style={{ fontFamily: 'var(--font-mono)' }}
                  className="text-[10px] text-[oklch(0.55_0_0)] mt-1"
                >
                  {count === 1 ? "1 note" : `${count} notes`}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="bauhaus-rule" />
      <div className="px-8 lg:px-16 py-6 bg-[oklch(0.96_0.003_90)] flex items-center gap-8">
        <div>
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-bold text-[oklch(0.12_0_0)]">
            {allTags.length}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] text-[oklch(0.50_0_0)] uppercase tracking-wider ml-2">
            unique tags
          </span>
        </div>
        <div className="h-6 w-px bg-[oklch(0.12_0_0/0.15)]" />
        <div>
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl font-bold text-[oklch(0.12_0_0)]">
            {notes.length}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] text-[oklch(0.50_0_0)] uppercase tracking-wider ml-2">
            observations
          </span>
        </div>
      </div>
    </div>
  );
}

/* Tag detail view — shows all notes for a specific tag */
function TagDetail({ tag }: { tag: string }) {
  const tagNotes = useMemo(() => getNotesByTag(tag), [tag]);
  const tagStats = useMemo(() => getTagStats(), []);

  // Find related tags (tags that co-occur with this tag)
  const relatedTags = useMemo(() => {
    const related = new Map<string, number>();
    for (const note of tagNotes) {
      for (const t of note.tags) {
        if (t !== tag) {
          related.set(t, (related.get(t) || 0) + 1);
        }
      }
    }
    return Array.from(related.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  }, [tag, tagNotes]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <Link href="/tags"
              className="inline-flex items-center gap-2 text-[oklch(0.50_0_0)] hover:text-[oklch(0.12_0_0)] transition-colors text-xs mb-6"
              style={{ fontFamily: 'var(--font-mono)' }}>
          <ArrowLeft className="w-3.5 h-3.5" />
          ALL TAGS
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <Hash className="w-5 h-5 text-[oklch(0.55_0.22_25)]" />
          <h1 style={{ fontFamily: 'var(--font-display)' }}
              className="text-2xl lg:text-3xl font-bold text-[oklch(0.12_0_0)]">
            {tag}
          </h1>
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-sm text-[oklch(0.50_0_0)] ml-2">
            {tagNotes.length} {tagNotes.length === 1 ? "note" : "notes"}
          </span>
        </div>
        <div className="bauhaus-rule-red w-16 mb-4" />
      </div>

      <div className="bauhaus-rule" />

      {/* Related tags */}
      {relatedTags.length > 0 && (
        <div className="px-8 lg:px-16 py-4 bg-[oklch(0.96_0.003_90)] border-b border-[oklch(0.12_0_0/0.10)]">
          <span style={{ fontFamily: 'var(--font-display)' }}
                className="text-[9px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mr-3">
            Related
          </span>
          <div className="inline-flex flex-wrap gap-1.5">
            {relatedTags.map(t => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}`}
                className="tag-pill hover:!bg-[oklch(0.12_0_0)] hover:!text-[oklch(0.98_0.005_90)] hover:!border-[oklch(0.12_0_0)] transition-all"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="px-8 lg:px-16 py-8">
        <div className="space-y-0">
          {tagNotes.map((note, i) => (
            <Link
              key={note.slug}
              href={`/note/${note.slug}`}
              className="group block border-b border-[oklch(0.12_0_0/0.10)] py-5 hover:bg-[oklch(0.12_0_0/0.03)] transition-colors px-2 -mx-2"
            >
              <div className="flex items-start gap-4 lg:gap-6">
                <span style={{ fontFamily: 'var(--font-display)' }}
                      className="text-2xl font-light text-[oklch(0.85_0_0)] w-10 shrink-0 text-right leading-none pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={categoryMarker[note.category] || 'marker-circle'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontFamily: 'var(--font-mono)' }}
                          className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.50_0_0)]">
                      {note.category}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}
                          className="text-[10px] text-[oklch(0.65_0_0)]">
                      {note.date}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}
                      className="text-lg font-semibold text-[oklch(0.12_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors mb-1">
                    {note.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)' }}
                     className="text-xs text-[oklch(0.45_0_0)] leading-relaxed line-clamp-2">
                    {note.excerpt}
                  </p>
                  {/* Show all tags, highlight the current one */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.map(t => (
                      <span
                        key={t}
                        className={`tag-pill ${t === tag ? '!bg-[oklch(0.12_0_0)] !text-[oklch(0.98_0.005_90)] !border-[oklch(0.12_0_0)]' : ''}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[oklch(0.70_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors shrink-0 mt-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

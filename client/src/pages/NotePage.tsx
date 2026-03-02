/*
 * NotePage — Individual note view
 * Bauhaus: clean reading pane, thick rules, geometric metadata
 */

import { useParams, Link } from "wouter";
import { notesBySlug, getBacklinks } from "@/lib/notes";
import NoteRenderer from "@/components/NoteRenderer";
import GraphView from "@/components/GraphView";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import TagPill from "@/components/TagPill";

const categoryMarker: Record<string, string> = {
  Mathematics: "marker-circle",
  Philosophy: "marker-square",
  Journal: "marker-triangle",
};

export default function NotePage() {
  const params = useParams<{ slug: string }>();
  const note = notesBySlug.get(params.slug || "");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!note) {
    return (
      <div className="px-8 lg:px-16 py-20">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-sm text-[oklch(0.50_0_0)]">
          Note not found.
        </p>
        <Link href="/" className="text-[oklch(0.55_0.22_25)] text-sm mt-4 inline-block hover:underline"
              style={{ fontFamily: 'var(--font-mono)' }}>
          ← Return to index
        </Link>
      </div>
    );
  }

  const backlinks = getBacklinks(note.slug);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[oklch(0.50_0_0)] hover:text-[oklch(0.12_0_0)] transition-colors text-xs mb-6"
              style={{ fontFamily: 'var(--font-mono)' }}>
          <ArrowLeft className="w-3.5 h-3.5" />
          INDEX
        </Link>

        {/* Metadata */}
        <div className="flex items-center gap-3 mb-3">
          <span className={categoryMarker[note.category] || 'marker-circle'} />
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.50_0_0)]">
            {note.category}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] text-[oklch(0.65_0_0)]">
            {note.date}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-3xl lg:text-4xl font-bold text-[oklch(0.12_0_0)] leading-tight mb-4">
          {note.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {note.tags.map(tag => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <div className="bauhaus-rule" />
      </div>

      {/* Content */}
      <div className="px-8 lg:px-16 py-8 max-w-3xl">
        {/* Journal images */}
        {note.type === 'journal' && note.journalImages && (
          <div className="mb-10">
            <p style={{ fontFamily: 'var(--font-mono)' }}
               className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.40_0_0)] mb-4">
              Scanned Pages
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {note.journalImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImg(img)}
                  className="border-2 border-[oklch(0.12_0_0/0.15)] hover:border-[oklch(0.55_0.22_25)] transition-colors overflow-hidden"
                >
                  <img src={img} alt={`Journal page ${i + 1}`} className="w-full h-auto" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="bauhaus-rule-thin my-8" />
          </div>
        )}

        {/* Markdown content */}
        <NoteRenderer content={note.content} />
      </div>

      {/* Connections section */}
      <div className="px-8 lg:px-16 py-8">
        <div className="bauhaus-rule mb-8" />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Outgoing links */}
          {note.links.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)' }}
                  className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mb-3">
                Links to
              </h3>
              {note.links.map(linkTitle => {
                const linked = Array.from(notesBySlug.values()).find(n => n.title === linkTitle);
                if (!linked) return null;
                return (
                  <Link key={linked.slug} href={`/note/${linked.slug}`}
                        className="flex items-center gap-2 py-2 text-sm text-[oklch(0.55_0.22_25)] hover:underline"
                        style={{ fontFamily: 'var(--font-mono)' }}>
                    <ArrowRight className="w-3 h-3" />
                    {linked.title}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)' }}
                  className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mb-3">
                Referenced by
              </h3>
              {backlinks.map(bl => (
                <Link key={bl.slug} href={`/note/${bl.slug}`}
                      className="flex items-center gap-2 py-2 text-sm text-[oklch(0.55_0.22_25)] hover:underline"
                      style={{ fontFamily: 'var(--font-mono)' }}>
                  <ArrowLeft className="w-3 h-3" />
                  {bl.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mini graph */}
      <div className="px-8 lg:px-16 py-8 bg-[oklch(0.96_0.003_90)]">
        <div className="bauhaus-rule-thin mb-6" />
        <p style={{ fontFamily: 'var(--font-display)' }}
           className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.40_0_0)] mb-4">
          Local Graph
        </p>
        <div className="border-2 border-[oklch(0.12_0_0)] bg-[oklch(0.98_0.005_90)]">
          <GraphView height={250} interactive={true} highlightSlug={note.slug} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
             onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Journal page" className="max-w-full max-h-[90vh] object-contain" />
          <button onClick={() => setLightboxImg(null)}
                  className="absolute top-4 right-4 text-white text-2xl font-light hover:text-[oklch(0.55_0.22_25)]"
                  style={{ fontFamily: 'var(--font-display)' }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

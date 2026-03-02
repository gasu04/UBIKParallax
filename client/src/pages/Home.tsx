/*
 * Home — UBIKParallax landing page
 * Bauhaus "Geometric Rationalism" — massive typography, catalog index, geometric accents
 */

import { Link } from "wouter";
import { notes } from "@/lib/notes";
import GraphView from "@/components/GraphView";
import { ArrowRight } from "lucide-react";
import TagPill from "@/components/TagPill";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029123676/GfJcD2gY9Jy5dUACSEzCRf/bauhaus-hero-6sUJd2L6fXXAYp6GGsdrj8.webp";

const categoryMarker: Record<string, string> = {
  Mathematics: "marker-circle",
  Philosophy: "marker-square",
  Journal: "marker-triangle",
};

export default function Home() {
  return (
    <div>
      {/* Hero — Typographic, Bauhaus */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden">
        {/* Background geometric composition */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-[0.07]" />
        </div>

        <div className="relative z-10 px-8 lg:px-16 pb-12 lg:pb-16 pt-20">
          {/* Large title */}
          <div className="mb-8">
            <h1 style={{ fontFamily: 'var(--font-display)' }}
                className="text-6xl sm:text-7xl lg:text-[120px] font-bold leading-[0.9] tracking-tight text-[oklch(0.12_0_0)]">
              UBIK
            </h1>
            <h1 style={{ fontFamily: 'var(--font-display)' }}
                className="text-6xl sm:text-7xl lg:text-[120px] font-bold leading-[0.9] tracking-tight text-[oklch(0.55_0.22_25)]">
              PARALLAX
            </h1>
          </div>

          {/* Red rule */}
          <div className="bauhaus-rule-red w-24 mb-6" />

          {/* Subtext */}
          <p style={{ fontFamily: 'var(--font-mono)' }}
             className="text-xs sm:text-sm text-[oklch(0.40_0_0)] max-w-xl leading-relaxed tracking-wide">
            Observations registered from outside the system — all temporal intervals accessible, none ranked, none sequential.
          </p>
        </div>
      </section>

      {/* Thick rule */}
      <div className="bauhaus-rule" />

      {/* Catalog Index */}
      <section className="px-8 lg:px-16 py-12 lg:py-16">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 style={{ fontFamily: 'var(--font-display)' }}
              className="text-xs tracking-[0.3em] uppercase text-[oklch(0.40_0_0)]">
            Catalog
          </h2>
          <div className="flex-1 h-px bg-[oklch(0.12_0_0/0.15)]" />
          <span style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] text-[oklch(0.50_0_0)]">
            {notes.length} entries
          </span>
        </div>

        <div className="space-y-0">
          {notes.map((note, i) => (
            <Link
              key={note.slug}
              href={`/note/${note.slug}`}
              className="group block border-b border-[oklch(0.12_0_0/0.10)] py-5 hover:bg-[oklch(0.12_0_0/0.03)] transition-colors px-2 -mx-2"
            >
              <div className="flex items-start gap-4 lg:gap-8">
                {/* Index number */}
                <span style={{ fontFamily: 'var(--font-display)' }}
                      className="text-3xl lg:text-4xl font-light text-[oklch(0.85_0_0)] w-12 lg:w-16 shrink-0 text-right leading-none pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
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
                  <h3 style={{ fontFamily: 'var(--font-display)' }}
                      className="text-lg lg:text-xl font-semibold text-[oklch(0.12_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors mb-1.5">
                    {note.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)' }}
                     className="text-xs text-[oklch(0.45_0_0)] leading-relaxed line-clamp-2">
                    {note.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {note.tags.slice(0, 4).map(tag => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-[oklch(0.70_0_0)] group-hover:text-[oklch(0.55_0.22_25)] transition-colors shrink-0 mt-2" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Graph Section */}
      <div className="bauhaus-rule" />
      <section className="px-8 lg:px-16 py-12 lg:py-16 bg-[oklch(0.96_0.003_90)]">
        <div className="flex items-baseline gap-4 mb-6">
          <h2 style={{ fontFamily: 'var(--font-display)' }}
              className="text-xs tracking-[0.3em] uppercase text-[oklch(0.40_0_0)]">
            Graph
          </h2>
          <div className="flex-1 h-px bg-[oklch(0.12_0_0/0.10)]" />
          <Link href="/graph" style={{ fontFamily: 'var(--font-mono)' }}
                className="text-[10px] text-[oklch(0.55_0.22_25)] hover:underline flex items-center gap-1">
            Full view <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-xs text-[oklch(0.50_0_0)] mb-6 max-w-md">
          ● Circle = Mathematics &nbsp;&nbsp; ■ Square = Philosophy &nbsp;&nbsp; ◆ Diamond = Journal
        </p>
        <div className="border-2 border-[oklch(0.12_0_0)] bg-[oklch(0.98_0.005_90)]">
          <GraphView height={350} interactive={true} />
        </div>
      </section>

      {/* Footer */}
      <div className="bauhaus-rule" />
      <footer className="px-8 lg:px-16 py-8 flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-mono)' }}
              className="text-[10px] text-[oklch(0.50_0_0)] tracking-wider uppercase">
          UBIKParallax — 2026
        </span>
        <div className="flex items-center gap-2">
          <span className="marker-circle" />
          <span className="marker-square" />
          <span className="marker-triangle" />
        </div>
      </footer>
    </div>
  );
}

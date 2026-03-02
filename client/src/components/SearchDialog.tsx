/*
 * SearchDialog — Bauhaus-styled command palette
 * Black/white/red, monospaced, geometric
 * Now with context snippets and keyword highlighting
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { searchNotesWithContext, type SearchResult } from "@/lib/notes";
import { useSearchHighlight } from "@/contexts/SearchHighlightContext";
import { Search, X, FileText, Tag, BookOpen, Layers } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/* Highlight matching keywords within a string */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[oklch(0.55_0.22_25/0.25)] text-[oklch(0.35_0.15_25)] px-0.5 rounded-sm font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* Icon for match field */
function MatchIcon({ field }: { field: string }) {
  const cls = "w-3 h-3 shrink-0 opacity-50";
  switch (field) {
    case "title": return <FileText className={cls} />;
    case "tag": return <Tag className={cls} />;
    case "content": return <BookOpen className={cls} />;
    case "category": return <Layers className={cls} />;
    default: return <FileText className={cls} />;
  }
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, navigate] = useLocation();
  const { setHighlightQuery } = useSearchHighlight();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const r = searchNotesWithContext(query);
    setResults(r);
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    // Pass the query to the highlight context so the note page can highlight it
    setHighlightQuery(query.trim());
    navigate(`/note/${result.note.slug}`);
    onClose();
  }, [navigate, onClose, query, setHighlightQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [results, selectedIndex, handleSelect, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const resultCount = results.length;
  const matchLabel = useMemo(() => {
    if (!query.trim()) return "";
    if (resultCount === 0) return "0 matches";
    return `${resultCount} match${resultCount !== 1 ? "es" : ""}`;
  }, [query, resultCount]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-[oklch(0.98_0.005_90)] border-2 border-[oklch(0.12_0_0)] shadow-2xl overflow-hidden fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-[oklch(0.12_0_0)]">
          <Search className="w-4 h-4 text-[oklch(0.40_0_0)] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search observations..."
            className="flex-1 bg-transparent text-[oklch(0.12_0_0)] placeholder:text-[oklch(0.60_0_0)] outline-none text-sm"
            style={{ fontFamily: 'var(--font-mono)' }}
            autoFocus
          />
          {query && (
            <span className="text-[10px] text-[oklch(0.50_0_0)] shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
              {matchLabel}
            </span>
          )}
          <button onClick={onClose} className="text-[oklch(0.40_0_0)] hover:text-[oklch(0.12_0_0)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-5 py-8 text-center text-[oklch(0.50_0_0)] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              No results for "{query}"
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={result.note.slug}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors border-b border-[oklch(0.12_0_0/0.06)] ${
                i === selectedIndex ? "bg-[oklch(0.12_0_0)] text-[oklch(0.95_0_0)]" : ""
              }`}
            >
              <div className="pt-1">
                <MatchIcon field={result.matchField} />
              </div>
              <div className="min-w-0 flex-1">
                {/* Title with highlighting */}
                <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                  <HighlightedText text={result.note.title} query={query} />
                </div>

                {/* Category + match field badge */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider opacity-60" style={{ fontFamily: 'var(--font-mono)' }}>
                    {result.note.category}
                  </span>
                  {result.matchField === "content" && (
                    <span
                      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${
                        i === selectedIndex
                          ? "bg-[oklch(0.55_0.22_25/0.3)] text-[oklch(0.85_0.1_25)]"
                          : "bg-[oklch(0.55_0.22_25/0.12)] text-[oklch(0.45_0.15_25)]"
                      }`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      body match
                    </span>
                  )}
                  {result.matchField === "tag" && (
                    <span
                      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${
                        i === selectedIndex
                          ? "bg-[oklch(0.55_0.22_25/0.3)] text-[oklch(0.85_0.1_25)]"
                          : "bg-[oklch(0.55_0.22_25/0.12)] text-[oklch(0.45_0.15_25)]"
                      }`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      tag match
                    </span>
                  )}
                </div>

                {/* Context snippet with highlighting */}
                {result.snippet && (
                  <p
                    className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                      i === selectedIndex ? "text-[oklch(0.75_0_0)]" : "text-[oklch(0.45_0_0)]"
                    }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    <HighlightedText text={result.snippet} query={query} />
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-[oklch(0.12_0_0/0.15)] flex items-center gap-4 text-[10px] text-[oklch(0.50_0_0)]"
             style={{ fontFamily: 'var(--font-mono)' }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          {query && <span className="ml-auto">matches highlighted on page</span>}
        </div>
      </div>
    </div>
  );
}

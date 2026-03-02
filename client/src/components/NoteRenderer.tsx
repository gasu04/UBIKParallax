/*
 * NoteRenderer — Renders note markdown content with wikilinks
 * Bauhaus "Geometric Rationalism" — clean, monospaced, structured
 * Now supports search keyword highlighting via SearchHighlightContext
 */

import { Link } from "wouter";
import { resolveWikilink } from "@/lib/notes";
import { useSearchHighlight } from "@/contexts/SearchHighlightContext";
import { useEffect, useRef } from "react";

interface NoteRendererProps {
  content: string;
  className?: string;
}

/* Highlight search terms within plain text segments */
function highlightSearchTerms(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={`hl-${i}`}
        className="search-highlight"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function parseInlineMarkdown(text: string, searchQuery: string = ""): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const segment = text.slice(lastIndex, match.index);
      parts.push(...highlightSearchTerms(segment, searchQuery).map((node, i) =>
        typeof node === 'string' ? <span key={`t-${key}-${i}`}>{node}</span> : node
      ));
      key++;
    }

    if (match[1]) {
      const raw = match[1];
      const pipeIndex = raw.indexOf('|');
      const title = pipeIndex >= 0 ? raw.slice(0, pipeIndex) : raw;
      const display = pipeIndex >= 0 ? raw.slice(pipeIndex + 1) : raw;
      const slug = resolveWikilink(title);

      if (slug) {
        parts.push(
          <Link key={key++} href={`/note/${slug}`} className="wikilink">
            {highlightSearchTerms(display, searchQuery)}
          </Link>
        );
      } else {
        parts.push(
          <span key={key++} className="text-[oklch(0.50_0_0)] italic" title={`"${title}" — not yet written`}>
            {highlightSearchTerms(display, searchQuery)}
          </span>
        );
      }
    } else if (match[2]) {
      parts.push(<strong key={key++}>{highlightSearchTerms(match[2], searchQuery)}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{highlightSearchTerms(match[3], searchQuery)}</em>);
    } else if (match[4]) {
      parts.push(<code key={key++}>{highlightSearchTerms(match[4], searchQuery)}</code>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const segment = text.slice(lastIndex);
    parts.push(...highlightSearchTerms(segment, searchQuery).map((node, i) =>
      typeof node === 'string' ? <span key={`e-${key}-${i}`}>{node}</span> : node
    ));
  }

  return parts;
}

function renderBlock(block: string, index: number, searchQuery: string): React.ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // Heading
  const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const text = headingMatch[2];
    const children = parseInlineMarkdown(text, searchQuery);
    if (level === 1) return <h1 key={index}>{children}</h1>;
    if (level === 2) return <h2 key={index}>{children}</h2>;
    if (level === 3) return <h3 key={index}>{children}</h3>;
    return <h4 key={index}>{children}</h4>;
  }

  // Horizontal rule — Bauhaus thick line
  if (/^---+$/.test(trimmed)) {
    return <div key={index} className="bauhaus-rule my-8" />;
  }

  // Blockquote
  if (trimmed.startsWith('>')) {
    const quoteText = trimmed.replace(/^>\s*/gm, '');
    return (
      <blockquote key={index}>
        {parseInlineMarkdown(quoteText, searchQuery)}
      </blockquote>
    );
  }

  // Unordered list
  if (trimmed.match(/^[-*]\s/m)) {
    const items = trimmed.split(/\n/).filter(l => l.trim().match(/^[-*]\s/));
    return (
      <ul key={index} className="list-disc">
        {items.map((item, i) => (
          <li key={i}>{parseInlineMarkdown(item.replace(/^[-*]\s+/, ''), searchQuery)}</li>
        ))}
      </ul>
    );
  }

  // Ordered list
  if (trimmed.match(/^\d+\.\s/m)) {
    const items = trimmed.split(/\n/).filter(l => l.trim().match(/^\d+\.\s/));
    return (
      <ol key={index} className="list-decimal">
        {items.map((item, i) => (
          <li key={i}>{parseInlineMarkdown(item.replace(/^\d+\.\s+/, ''), searchQuery)}</li>
        ))}
      </ol>
    );
  }

  // Regular paragraph
  return <p key={index}>{parseInlineMarkdown(trimmed, searchQuery)}</p>;
}

export default function NoteRenderer({ content, className = '' }: NoteRendererProps) {
  const blocks = content.split(/\n\n+/);
  const { highlightQuery, clearHighlight } = useSearchHighlight();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the first highlighted match
  useEffect(() => {
    if (highlightQuery && containerRef.current) {
      const timer = setTimeout(() => {
        const firstMark = containerRef.current?.querySelector('.search-highlight');
        if (firstMark) {
          firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightQuery]);

  return (
    <div className={`note-prose ${className}`} ref={containerRef}>
      {/* Highlight banner */}
      {highlightQuery && (
        <div className="flex items-center gap-3 mb-6 px-4 py-2.5 bg-[oklch(0.55_0.22_25/0.08)] border-l-3 border-[oklch(0.55_0.22_25)]">
          <span
            className="text-[11px] text-[oklch(0.40_0.10_25)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Highlighting: <strong className="text-[oklch(0.35_0.15_25)]">"{highlightQuery}"</strong>
          </span>
          <button
            onClick={clearHighlight}
            className="ml-auto text-[10px] text-[oklch(0.50_0_0)] hover:text-[oklch(0.12_0_0)] uppercase tracking-wider transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Clear
          </button>
        </div>
      )}
      {blocks.map((block, i) => renderBlock(block, i, highlightQuery))}
    </div>
  );
}

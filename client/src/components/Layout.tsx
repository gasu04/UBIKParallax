/*
 * Layout — Bauhaus "Geometric Rationalism"
 * Black sidebar, geometric navigation, asymmetric structure
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { notes } from "@/lib/notes";
import SearchDialog from "./SearchDialog";
import { Search, Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navLinks = [
    { href: "/", label: "INDEX" },
    { href: "/graph", label: "GRAPH" },
    { href: "/browse", label: "CATALOG" },
    { href: "/tags", label: "TAGS" },
    { href: "/about", label: "ABOUT" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[oklch(0.12_0_0)] text-[oklch(0.85_0_0)] px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <span style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold tracking-[0.15em] uppercase">
          UBIKParallax
        </span>
        <button onClick={() => setSearchOpen(true)}>
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[oklch(0.12_0_0)] text-[oklch(0.75_0_0)] overflow-y-auto slide-in">
            <div className="p-5 flex items-center justify-between">
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-xs font-semibold tracking-[0.2em] uppercase text-[oklch(0.85_0_0)]">
                UBIKParallax
              </span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4 text-[oklch(0.5_0_0)]" />
              </button>
            </div>
            <SidebarContent
              navLinks={navLinks}
              location={location}
              onSearch={() => setSearchOpen(true)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — black vertical bar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 bg-[oklch(0.12_0_0)] text-[oklch(0.75_0_0)] h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 pb-5">
          <Link href="/" className="block">
            <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold tracking-[0.15em] uppercase text-[oklch(0.95_0_0)]">
              UBIK
            </h1>
            <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold tracking-[0.15em] uppercase text-[oklch(0.55_0.22_25)]">
              Parallax
            </h1>
          </Link>
          <div className="mt-3 h-[2px] bg-[oklch(0.55_0.22_25)]" />
        </div>
        <SidebarContent
          navLinks={navLinks}
          location={location}
          onSearch={() => setSearchOpen(true)}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto pt-12 lg:pt-0">
        <div className="fade-in">
          {children}
        </div>
      </main>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

interface SidebarContentProps {
  navLinks: { href: string; label: string }[];
  location: string;
  onSearch: () => void;
}

function SidebarContent({ navLinks, location, onSearch }: SidebarContentProps) {
  return (
    <div className="flex flex-col flex-1 py-2">
      {/* Search */}
      <div className="px-4 mb-6">
        <button
          onClick={onSearch}
          className="w-full flex items-center gap-2 px-3 py-2 text-[oklch(0.50_0_0)] hover:text-[oklch(0.85_0_0)] transition-colors text-xs tracking-wider uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="ml-auto text-[9px] opacity-40">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 mb-8">
        {navLinks.map(link => {
          const isActive = link.href === '/tags'
                ? location === '/tags' || location.startsWith('/tags/')
                : location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 text-xs tracking-[0.2em] transition-colors ${
                isActive
                  ? "text-[oklch(0.55_0.22_25)] font-medium"
                  : "text-[oklch(0.50_0_0)] hover:text-[oklch(0.85_0_0)]"
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isActive && <span className="mr-2">●</span>}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 h-px bg-[oklch(0.98_0_0/0.08)] mb-6" />

      {/* Notes list */}
      <div className="px-4 flex-1">
        <p className="px-3 mb-3 text-[9px] tracking-[0.3em] uppercase text-[oklch(0.40_0_0)]"
           style={{ fontFamily: 'var(--font-display)' }}>
          Notes
        </p>
        {notes.map(note => {
          const isActive = location === `/note/${note.slug}`;
          return (
            <Link
              key={note.slug}
              href={`/note/${note.slug}`}
              className={`block px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "text-[oklch(0.55_0.22_25)]"
                  : "text-[oklch(0.45_0_0)] hover:text-[oklch(0.75_0_0)]"
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {note.title}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 mt-auto">
        <div className="h-px bg-[oklch(0.98_0_0/0.08)] mb-3" />
        <p className="text-[9px] text-[oklch(0.35_0_0)] tracking-wider uppercase"
           style={{ fontFamily: 'var(--font-mono)' }}>
          {notes.length} observations
        </p>
      </div>
    </div>
  );
}

/*
 * SearchHighlightContext — Passes the active search query
 * from the SearchDialog to the NoteRenderer so matched
 * keywords can be highlighted on the destination page.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface SearchHighlightContextType {
  highlightQuery: string;
  setHighlightQuery: (q: string) => void;
  clearHighlight: () => void;
}

const SearchHighlightContext = createContext<SearchHighlightContextType>({
  highlightQuery: "",
  setHighlightQuery: () => {},
  clearHighlight: () => {},
});

export function SearchHighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlightQuery, setHighlightQueryState] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHighlightQuery = useCallback((q: string) => {
    setHighlightQueryState(q);
    // Auto-clear after 8 seconds so highlights don't persist forever
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q) {
      timerRef.current = setTimeout(() => {
        setHighlightQueryState("");
      }, 8000);
    }
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightQueryState("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SearchHighlightContext.Provider value={{ highlightQuery, setHighlightQuery, clearHighlight }}>
      {children}
    </SearchHighlightContext.Provider>
  );
}

export function useSearchHighlight() {
  return useContext(SearchHighlightContext);
}

import { useState, useEffect } from "react";

/**
 * Custom hook for tracking media query matches
 * @param query - The media query to track
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Default to false for SSR
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Set initial state
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener to the media query
    media.addEventListener("change", listener);

    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}

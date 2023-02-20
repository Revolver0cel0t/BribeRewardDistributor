import { useEffect, useState } from "react";

export const useMediaQueryHit = (query: string, type: "min" | "max") => {
  const [matches, setMatches] = useState(window.matchMedia(`(${type}-width: ${query})`).matches);

  useEffect(() => {
    window.matchMedia(`(${type}-width: ${query})`).addEventListener("change", e => setMatches(e.matches));
    return () => {
      window.matchMedia(`(${type}-width: ${query})`).removeEventListener("change", e => setMatches(e.matches));
    };
  }, []);

  return matches;
};

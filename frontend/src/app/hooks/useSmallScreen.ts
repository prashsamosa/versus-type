import { useEffect, useState } from "react";

export function useSmallScreen(): boolean {
	const [matches, setMatches] = useState(false);
	const query = "(max-width: 48rem)";
	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);

		function handleChange(e: MediaQueryListEvent) {
			setMatches(e.matches);
		}

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [query]);

	return matches;
}

/**
 * ThemeProvider - React Context for Theme Management
 *
 * Provides theme state and utilities to all child components via React Context.
 * Integrates with the 6-token design system and localStorage persistence.
 *
 * USAGE:
 * ```tsx
 * // Wrap your app
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Use in components
 * const { theme, setTheme, isDark } = useTheme();
 * ```
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '@/lib/theme';
import { getTheme, setTheme as setThemeUtil, onSystemThemeChange } from '@/lib/theme';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	isDark: boolean;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Initialize theme from localStorage or system preference
		const savedTheme = getTheme();
		setThemeState(savedTheme);

		// Check if dark mode is active
		const checkDark = () => {
			const dark = document.documentElement.classList.contains('dark');
			setIsDark(dark);
		};

		checkDark();

		// Listen for system theme changes
		const cleanup = onSystemThemeChange((isDark) => {
			if (theme === 'system') {
				setIsDark(isDark);
			}
		});

		// Listen for manual theme changes (from other components)
		const observer = new MutationObserver(checkDark);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => {
			cleanup();
			observer.disconnect();
		};
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		setThemeUtil(newTheme);
	};

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

/**
 * Hook to access theme context
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, isDark, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current: {theme} ({isDark ? 'Dark' : 'Light'})
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
}

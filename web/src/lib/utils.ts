/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

/**
 * Extract a cookie value by name
 */
export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;

	const cookies = document.cookie.split("; ");
	const cookie = cookies.find((row) => row.startsWith(`${name}=`));
	return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

/**
 * Get CSRF token from cookies
 * Better Auth stores CSRF token in the 'better-auth.csrf-token' cookie
 */
export function getCSRFToken(): string | null {
	return getCookie("better-auth.csrf-token");
}

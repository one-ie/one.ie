import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectSearchProps {
	onSearch: (query: string) => void;
	placeholder?: string;
}

export function ProjectSearch({
	onSearch,
	placeholder = "Search projects by name, description, or level...",
}: ProjectSearchProps) {
	const [query, setQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			if (typeof onSearch === "function") {
				onSearch(query);
			}
			// Also dispatch event for ClientProjectsManager
			const event = new CustomEvent("projectSearch", { detail: { query } });
			window.dispatchEvent(event);
		}, 300);

		return () => clearTimeout(timer);
	}, [query, onSearch]);

	const handleClear = () => {
		setQuery("");
	};

	return (
		<div className="relative w-full">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
			<Input
				type="text"
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="pl-9 pr-9 h-10"
			/>
			{query && (
				<Button
					onClick={handleClear}
					variant="ghost"
					size="sm"
					className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

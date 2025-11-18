"use client";

import type { CollectionEntry } from "astro:content";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

type DocEntry = CollectionEntry<"docs">;

interface SidebarDocsProps {
	entries: DocEntry[];
	currentSlug: string;
}

export function SidebarDocs({ entries, currentSlug }: SidebarDocsProps) {
	const [expandedFolders, setExpandedFolders] = useState<
		Record<string, boolean>
	>({
		"getting-started": true,
		overview: true,
		develop: true,
		"develop-platform": true,
	});

	const folderOrder = {
		"getting-started": 1,
		overview: 2,
		develop: 3,
		"develop-platform": 10,
	};

	const folderDisplayNames = {
		"getting-started": "Quick Start",
		overview: "Overview",
		develop: "Develop",
		"develop-platform": "Develop Platform",
	};

	const folderIcons: Record<string, string> = {
		"getting-started": "🚀",
		overview: "🏗️",
		develop: "⚡",
		"develop-platform": "🔧",
	};

	// Group entries by folder
	const groupedEntries = useMemo(() => {
		const groups: Record<string, DocEntry[]> = {};

		entries.forEach((entry) => {
			const folder = entry.slug.includes("/")
				? entry.slug.split("/")[0]
				: "getting-started";

			if (!groups[folder]) {
				groups[folder] = [];
			}
			groups[folder].push(entry);
		});

		// Sort each folder's entries by order
		Object.keys(groups).forEach((folder) => {
			groups[folder].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
		});

		return groups;
	}, [entries]);

	const sortedFolders = Object.keys(groupedEntries).sort((a, b) => {
		const orderA = (folderOrder as Record<string, number>)[a] ?? 999;
		const orderB = (folderOrder as Record<string, number>)[b] ?? 999;
		return orderA - orderB;
	});

	const toggleFolder = (folder: string) => {
		setExpandedFolders((prev) => ({
			...prev,
			[folder]: !prev[folder],
		}));
	};

	return (
		<aside className="hidden lg:flex lg:flex-col w-64 border-r border-border/40 bg-muted/20 sticky top-0 h-screen">
			<nav className="p-4 space-y-1 overflow-y-auto flex-1">
				{sortedFolders.map((folder) => {
					const displayName =
						(folderDisplayNames as Record<string, string>)[folder] || folder;
					const icon = (folderIcons as Record<string, string>)[folder] || "📁";
					const docs = groupedEntries[folder] || [];
					const isExpanded = expandedFolders[folder] ?? true;

					return (
						<div key={folder}>
							<button
								onClick={() => toggleFolder(folder)}
								className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors text-sm font-semibold text-foreground"
							>
								<span className="flex items-center gap-2">
									<span>{icon}</span>
									<span>{displayName}</span>
								</span>
								<ChevronDown
									className={`w-4 h-4 transition-transform ${
										isExpanded ? "" : "-rotate-90"
									}`}
								/>
							</button>

							{isExpanded && (
								<div className="ml-2 space-y-1 border-l border-border/20">
									{docs.map((doc) => {
										const isActive = doc.slug === currentSlug;
										return (
											<a
												key={doc.id}
												href={`/docs/${doc.slug}`}
												className={`block px-3 py-2 rounded-lg text-sm transition-colors no-underline ${
													isActive
														? "bg-primary/10 text-primary font-medium"
														: "text-muted-foreground hover:text-foreground hover:bg-muted/30"
												}`}
											>
												{doc.data.title}
											</a>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</nav>
		</aside>
	);
}

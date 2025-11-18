"use client";

import type { CollectionEntry } from "astro:content";
import { FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DocEntry = CollectionEntry<"docs">;

interface DocCompactProps {
	entries: DocEntry[];
	onTagClick?: (tag: string) => void;
}

export function DocCompact({ entries, onTagClick }: DocCompactProps) {
	const createTagUrl = (tag: string) => `/docs?tag=${encodeURIComponent(tag)}`;

	return (
		<div className="border border-border/30 rounded-lg overflow-hidden">
			<div className="divide-y divide-border/30">
				{entries
					.sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
					.map((entry) => (
						<div
							key={entry.id}
							className="grid grid-cols-[auto_1fr_auto] items-center bg-[hsl(var(--color-sidebar-background))] hover:opacity-80 cursor-pointer transition-opacity"
							onClick={() => {
								window.location.href = `/docs/${entry.slug}`;
							}}
						>
							<div className="p-2">
								<div className="p-1.5 rounded-md bg-muted/40 flex items-center justify-center">
									<FileText className="w-4 h-4 text-muted-foreground" />
								</div>
							</div>
							<div className="p-2">
								<h3 className="text-base font-medium hover:text-primary transition-colors">
									{entry.data.title}
								</h3>
							</div>
							<div className="p-2 flex flex-wrap gap-1 justify-end">
								{entry.data.tags ? (
									entry.data.tags.slice(0, 3).map((tag) => (
										<a
											key={tag}
											href={createTagUrl(tag)}
											className="no-underline hover:no-underline"
											onClick={(e) => e.stopPropagation()}
										>
											<Badge className="text-xs px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary border-none flex items-center gap-1 cursor-pointer">
												<Tag className="w-3 h-3" />
												<span>{tag}</span>
											</Badge>
										</a>
									))
								) : (
									<span className="text-xs text-muted-foreground">-</span>
								)}
								{entry.data.tags && entry.data.tags.length > 3 && (
									<span className="text-xs text-muted-foreground">
										+{entry.data.tags.length - 3}
									</span>
								)}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}

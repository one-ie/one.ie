interface SiteHeaderProps {
	user?: {
		id: string;
		email: string;
		name?: string;
	};
}

export function SiteHeader({ user }: SiteHeaderProps) {
	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<div className="ml-auto flex items-center gap-2">
					{user && (
						<span className="text-sm text-muted-foreground hidden sm:inline">
							{user.name || user.email}
						</span>
					)}
				</div>
			</div>
		</header>
	);
}

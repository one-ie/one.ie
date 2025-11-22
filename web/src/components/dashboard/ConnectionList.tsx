/**
 * ConnectionList Component
 *
 * Display entity connections (relationships) with direction indicators.
 */

import React from "react";
import { Badge } from "@/components/ui/badge";

interface Connection {
	_id: string;
	fromEntityId: string;
	toEntityId: string;
	relationshipType: string;
	metadata?: Record<string, any>;
	strength?: number;
}

interface ConnectionListProps {
	entityId: string;
	outgoing: Connection[];
	incoming: Connection[];
}

export function ConnectionList({
	entityId,
	outgoing,
	incoming,
}: ConnectionListProps) {
	return (
		<div className="space-y-6">
			{/* Outgoing Connections */}
			<div>
				<h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
					Outgoing Connections ({outgoing.length})
				</h4>
				{outgoing.length === 0 ? (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						No outgoing connections
					</p>
				) : (
					<div className="space-y-2">
						{outgoing.map((conn) => (
							<div
								key={conn._id}
								className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3"
							>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-700 dark:text-gray-300">
										→
									</span>
									<Badge variant="outline">{conn.relationshipType}</Badge>
									<a
										href={`/dashboard/things/${conn.toEntityId}`}
										className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										View target entity
									</a>
								</div>
								{conn.strength && (
									<span className="text-xs text-gray-500 dark:text-gray-400">
										Strength: {conn.strength}
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Incoming Connections */}
			<div>
				<h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
					Incoming Connections ({incoming.length})
				</h4>
				{incoming.length === 0 ? (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						No incoming connections
					</p>
				) : (
					<div className="space-y-2">
						{incoming.map((conn) => (
							<div
								key={conn._id}
								className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3"
							>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-700 dark:text-gray-300">
										←
									</span>
									<Badge variant="outline">{conn.relationshipType}</Badge>
									<a
										href={`/dashboard/things/${conn.fromEntityId}`}
										className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										View source entity
									</a>
								</div>
								{conn.strength && (
									<span className="text-xs text-gray-500 dark:text-gray-400">
										Strength: {conn.strength}
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

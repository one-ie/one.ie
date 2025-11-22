/**
 * DeploymentService
 *
 * Service for managing deployments - rollbacks, deletions, and comparisons.
 * Uses Convex mutations for backend operations.
 */

import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

export class DeploymentService {
	private convex: ConvexHttpClient;

	constructor(convexUrl: string) {
		this.convex = new ConvexHttpClient(convexUrl);
	}

	/**
	 * Rollback to a previous deployment
	 * Creates a new deployment with the same code as the target deployment
	 */
	async rollback(
		websiteId: string,
		targetDeploymentId: string
	): Promise<string> {
		try {
			const newDeploymentId = await this.convex.mutation(
				api.mutations.deployments.rollback,
				{
					websiteId,
					targetDeploymentId,
				}
			);
			return newDeploymentId;
		} catch (error) {
			console.error("Rollback failed:", error);
			throw new Error(
				`Failed to rollback deployment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Delete a deployment
	 * Note: This mutation may not exist yet - add to backend if needed
	 */
	async delete(deploymentId: string): Promise<void> {
		try {
			// This would call a delete mutation if it exists
			// For now, this is a placeholder for future implementation
			console.log("Delete mutation not yet implemented", deploymentId);
		} catch (error) {
			console.error("Delete failed:", error);
			throw new Error(
				`Failed to delete deployment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Get deployment history for a website
	 */
	async getHistory(websiteId: string, limit?: number) {
		try {
			const history = await this.convex.query(
				api.queries.deployments.getHistory,
				{
					websiteId,
					limit,
				}
			);
			return history;
		} catch (error) {
			console.error("Failed to fetch deployment history:", error);
			throw new Error(
				`Failed to fetch deployment history: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Get deployment details
	 */
	async get(deploymentId: string) {
		try {
			const deployment = await this.convex.query(
				api.queries.deployments.get,
				{
					id: deploymentId,
				}
			);
			return deployment;
		} catch (error) {
			console.error("Failed to fetch deployment:", error);
			throw new Error(
				`Failed to fetch deployment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Get latest deployment for a website
	 */
	async getLatest(
		websiteId: string,
		environment?: "production" | "preview" | "development"
	) {
		try {
			const latest = await this.convex.query(
				api.queries.deployments.getLatest,
				{
					websiteId,
					environment,
				}
			);
			return latest;
		} catch (error) {
			console.error("Failed to fetch latest deployment:", error);
			throw new Error(
				`Failed to fetch latest deployment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Compare two deployments (placeholder)
	 * In the future, this would fetch code differences from git
	 */
	async compare(
		fromDeploymentId: string,
		toDeploymentId?: string
	): Promise<
		Array<{
			path: string;
			status: "added" | "modified" | "deleted";
			additions: number;
			deletions: number;
		}>
	> {
		try {
			// This is a placeholder for future git integration
			// Would call a backend service that:
			// 1. Gets git commits for both deployments
			// 2. Diffs the trees
			// 3. Returns file changes

			console.log("Comparing deployments:", {
				from: fromDeploymentId,
				to: toDeploymentId,
			});

			// Return empty for now
			return [];
		} catch (error) {
			console.error("Failed to compare deployments:", error);
			throw new Error(
				`Failed to compare deployments: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Format deployment status for display
	 */
	static formatStatus(
		status: "deploying" | "live" | "failed",
		isLatest?: boolean
	): string {
		if (status === "deploying") return "Deploying...";
		if (status === "failed") return "Failed";
		if (status === "live" && isLatest) return "Live (Current)";
		if (status === "live") return "Live (Previous)";
		return status;
	}

	/**
	 * Format duration in human readable format
	 */
	static formatDuration(milliseconds: number): string {
		if (!milliseconds) return "—";
		const seconds = Math.floor(milliseconds / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		return `${minutes}m ${seconds % 60}s`;
	}

	/**
	 * Get status color for UI
	 */
	static getStatusVariant(
		status: "deploying" | "live" | "failed"
	): "default" | "secondary" | "destructive" | "outline" {
		switch (status) {
			case "live":
				return "default";
			case "failed":
				return "destructive";
			case "deploying":
				return "secondary";
			default:
				return "outline";
		}
	}
}

/**
 * Singleton instance (initialized once)
 */
let instance: DeploymentService | null = null;

export function getDeploymentService(): DeploymentService {
	const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		throw new Error("PUBLIC_CONVEX_URL environment variable is not set");
	}

	if (!instance) {
		instance = new DeploymentService(convexUrl);
	}

	return instance;
}

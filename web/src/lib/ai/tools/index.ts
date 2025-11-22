/**
 * AI Tools
 *
 * Export all AI tools for website generation and AI clones
 */

// Code generation tools
export { generateAstroPageTool } from "./generateAstroPage";
export { modifyCodeTool } from "./modifyCode";
export { searchComponentsTool } from "./searchComponents";

// AI clone tools
export {
	cloneTools,
	toolNames,
	toolMetadata,
	searchKnowledgeTool,
	createContentTool,
	scheduleMeetingTool,
	sendEmailTool,
	checkCalendarTool,
	accessCourseTool,
	recommendProductTool,
} from "./clone-tools";

// Types
export type {
	CloneToolName,
	CloneToolMetadata,
	CloneToolCategory,
} from "./clone-tools";

/**
 * All tools combined
 */
import { generateAstroPageTool } from "./generateAstroPage";
import { modifyCodeTool } from "./modifyCode";
import { searchComponentsTool } from "./searchComponents";
import { cloneTools } from "./clone-tools";

export const codeGenerationTools = {
	generateAstroPage: generateAstroPageTool,
	modifyCode: modifyCodeTool,
	searchComponents: searchComponentsTool,
};

export const aiCloneTools = cloneTools;

export const allTools = {
	...codeGenerationTools,
	...cloneTools,
};

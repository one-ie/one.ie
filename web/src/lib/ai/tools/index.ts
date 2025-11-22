/**
 * AI Code Generation Tools
 *
 * Export all AI tools for website generation
 */

export { generateAstroPageTool } from "./generateAstroPage";
export { modifyCodeTool } from "./modifyCode";
export { searchComponentsTool } from "./searchComponents";

/**
 * All tools combined
 */
import { generateAstroPageTool } from "./generateAstroPage";
import { modifyCodeTool } from "./modifyCode";
import { searchComponentsTool } from "./searchComponents";

export const codeGenerationTools = {
	generateAstroPage: generateAstroPageTool,
	modifyCode: modifyCodeTool,
	searchComponents: searchComponentsTool,
};

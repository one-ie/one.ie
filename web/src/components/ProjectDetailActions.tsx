import { useEffect, useState } from "react";
import { SendToClaudeCodeModal } from "./SendToClaudeCodeModal";

interface ProjectDetailActionsProps {
	prompt: string;
	projectTitle: string;
}

export function ProjectDetailActions({
	prompt,
	projectTitle,
}: ProjectDetailActionsProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Set up event listener for the button click
	useEffect(() => {
		const handleClick = () => {
			setIsModalOpen(true);
		};

		const button = document.getElementById("send-to-claude-btn");
		button?.addEventListener("click", handleClick);

		return () => {
			button?.removeEventListener("click", handleClick);
		};
	}, []);

	return (
		<SendToClaudeCodeModal
			isOpen={isModalOpen}
			onClose={() => setIsModalOpen(false)}
			prompt={prompt}
			projectTitle={projectTitle}
		/>
	);
}

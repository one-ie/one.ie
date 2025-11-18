import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VideoPlayer } from "./VideoPlayer";

describe("VideoPlayer", () => {
	it("renders YouTube embed for YouTube URLs", () => {
		const { container } = render(
			<VideoPlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />,
		);
		const iframe = container.querySelector("iframe");
		expect(iframe).toBeTruthy();
		expect(iframe?.src).toContain("youtube.com/embed");
	});

	it("renders native video player for non-YouTube URLs", () => {
		const { container } = render(
			<VideoPlayer src="https://example.com/video.mp4" />,
		);
		const video = container.querySelector("video");
		expect(video).toBeTruthy();
	});

	it("renders audio player for audio files", () => {
		const { container } = render(
			<VideoPlayer src="https://example.com/audio.mp3" type="audio" />,
		);
		const audio = container.querySelector("audio");
		expect(audio).toBeTruthy();
	});

	it("applies custom className", () => {
		const { container } = render(
			<VideoPlayer
				src="https://example.com/video.mp4"
				className="custom-class"
			/>,
		);
		expect(container.firstChild).toHaveClass("custom-class");
	});
});

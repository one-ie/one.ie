/**
 * CheckboxProcessor Component
 * Client-side component that processes checkbox markdown syntax in the DOM
 * Converts [x] to green checkmarks and [ ] to empty checkboxes
 */

import { useEffect } from "react";

interface CheckboxProcessorProps {
  containerSelector?: string;
}

/**
 * Process a text node and replace checkbox patterns with styled elements
 */
function processTextNode(textNode: Text, parent: Node) {
  const text = textNode.nodeValue || "";
  const completedPattern = /\[\s*[xX]\s*\]/g;
  const pendingPattern = /\[\s*\]/g;

  // Check if there are any checkboxes
  if (!completedPattern.test(text) && !pendingPattern.test(text)) {
    return;
  }

  // Reset patterns for actual replacement
  const patterns = [
    { regex: /\[\s*[xX]\s*\]/g, className: "checkbox-completed", text: "✓" },
    { regex: /\[\s*\]/g, className: "checkbox-pending", text: "" },
  ];

  let htmlContent = text;
  patterns.forEach(({ regex, className, text: content }) => {
    htmlContent = htmlContent.replace(regex, `<span class="${className}">${content}</span>`);
  });

  // Only replace if changes were made
  if (htmlContent !== text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Replace the original text node with the processed content
    while (tempDiv.firstChild) {
      parent.insertBefore(tempDiv.firstChild, textNode);
    }
    parent.removeChild(textNode);
  }
}

/**
 * Recursively process all text nodes in a container
 */
function processElement(element: Element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  const nodesToProcess: [Text, Node][] = [];

  let node = walker.nextNode() as Text | null;
  while (node) {
    // Skip text inside code blocks
    const parentElement = node.parentElement;
    if (parentElement && !parentElement.closest("code, pre")) {
      nodesToProcess.push([node, parentElement]);
    }
    node = walker.nextNode() as Text | null;
  }

  // Process in reverse order to maintain correct node references
  for (let i = nodesToProcess.length - 1; i >= 0; i--) {
    const [textNode, parent] = nodesToProcess[i];
    processTextNode(textNode, parent);
  }
}

export function CheckboxProcessor({ containerSelector = ".plan-content" }: CheckboxProcessorProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (container) {
      processElement(container as Element);
    }
  }, [containerSelector]);

  return null;
}

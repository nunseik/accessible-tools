export type BlockType = "text" | "bullet" | "checkbox";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

let _nextId = 0;
export function genId(): string {
  return `b${++_nextId}`;
}

export function markdownToBlocks(markdown: string): Block[] {
  if (!markdown.trim()) {
    return [{ id: genId(), type: "text", content: "" }];
  }
  return markdown.split("\n").map((line) => {
    const cbMatch = line.match(/^- \[([ x])\] (.*)$/);
    if (cbMatch) {
      return { id: genId(), type: "checkbox" as const, content: cbMatch[2], checked: cbMatch[1] === "x" };
    }
    const bMatch = line.match(/^- (.*)$/);
    if (bMatch) {
      return { id: genId(), type: "bullet" as const, content: bMatch[1] };
    }
    return { id: genId(), type: "text" as const, content: line };
  });
}

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "bullet") return `- ${b.content}`;
      if (b.type === "checkbox") return `- [${b.checked ? "x" : " "}] ${b.content}`;
      return b.content;
    })
    .join("\n");
}

export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .filter((b) => b.content.trim())
    .map((b) => b.content)
    .join(". ");
}

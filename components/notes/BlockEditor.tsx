"use client";
import { useRef, useEffect, KeyboardEvent } from "react";
import { Block, BlockType, genId } from "@/lib/noteBlocks";
import { cn } from "@/lib/utils";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  className?: string;
}

export function BlockEditor({ blocks, onChange, placeholder, className }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function focusBlock(id: string, atEnd = true) {
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLTextAreaElement>(`[data-block-id="${id}"]`);
      if (!el) return;
      el.focus();
      const pos = atEnd ? el.value.length : 0;
      el.setSelectionRange(pos, pos);
    });
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function addBlockAfter(afterId: string, type: BlockType) {
    const newBlock: Block = { id: genId(), type, content: "", checked: false };
    const idx = blocks.findIndex((b) => b.id === afterId);
    const next = [...blocks];
    next.splice(idx + 1, 0, newBlock);
    onChange(next);
    focusBlock(newBlock.id, false);
  }

  function deleteBlock(id: string) {
    if (blocks.length === 1) {
      onChange([{ id: blocks[0].id, type: "text", content: "" }]);
      return;
    }
    const idx = blocks.findIndex((b) => b.id === id);
    const next = blocks.filter((b) => b.id !== id);
    onChange(next);
    const prevId = idx > 0 ? blocks[idx - 1].id : next[0].id;
    focusBlock(prevId, true);
  }

  function handleKeyDown(id: string, e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const block = blocks.find((b) => b.id === id)!;
      addBlockAfter(id, block.type !== "text" ? block.type : "text");
    }
    if (e.key === "Backspace") {
      const block = blocks.find((b) => b.id === id)!;
      if (block.content === "") {
        e.preventDefault();
        deleteBlock(id);
      }
    }
  }

  function handleTextChange(id: string, value: string) {
    const block = blocks.find((b) => b.id === id)!;
    if (block.type === "text") {
      if (value.startsWith("- [ ] ") || value.startsWith("- [] ")) {
        updateBlock(id, { type: "checkbox", content: value.replace(/^- \[[ ]?\] /, ""), checked: false });
        return;
      }
      if (value.startsWith("- ")) {
        updateBlock(id, { type: "bullet", content: value.slice(2) });
        return;
      }
    }
    updateBlock(id, { content: value });
  }

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)}>
      {blocks.map((block, i) => (
        <BlockRow
          key={block.id}
          block={block}
          placeholder={i === 0 ? placeholder : undefined}
          onChange={(patch) => updateBlock(block.id, patch)}
          onKeyDown={(e) => handleKeyDown(block.id, e)}
          onTextChange={(value) => handleTextChange(block.id, value)}
        />
      ))}
    </div>
  );
}

interface BlockRowProps {
  block: Block;
  placeholder?: string;
  onChange: (patch: Partial<Block>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextChange: (value: string) => void;
}

function BlockRow({ block, placeholder, onChange, onKeyDown, onTextChange }: BlockRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.content]);

  return (
    <div className="flex items-start gap-3 py-1 min-h-[2.75rem]">
      {block.type === "checkbox" && (
        <input
          type="checkbox"
          checked={block.checked ?? false}
          onChange={(e) => onChange({ checked: e.target.checked })}
          aria-label={block.content || "Checklist item"}
          className="w-6 h-6 mt-2 flex-shrink-0 accent-primary cursor-pointer"
        />
      )}
      {block.type === "bullet" && (
        <span className="text-primary font-bold text-xl mt-1.5 flex-shrink-0 select-none leading-none" aria-hidden="true">
          •
        </span>
      )}
      <textarea
        ref={textareaRef}
        data-block-id={block.id}
        value={block.content}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        aria-label={
          block.type === "checkbox"
            ? "Checklist item text"
            : block.type === "bullet"
            ? "Bullet item text"
            : "Note text"
        }
        className={cn(
          "flex-1 bg-transparent resize-none focus:outline-none text-xl leading-relaxed overflow-hidden placeholder:text-muted-foreground",
          block.checked && "line-through text-muted-foreground"
        )}
      />
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/db";
import { VoiceInput } from "@/components/accessibility/VoiceInput";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { BlockEditor } from "@/components/notes/BlockEditor";
import { Block, blocksToMarkdown, blocksToPlainText, genId, markdownToBlocks } from "@/lib/noteBlocks";
import { processVoiceText, getVoiceCommandHints } from "@/lib/voiceCommands";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const INITIAL_BLOCKS: Block[] = [{ id: "b0", type: "text", content: "" }];

export default function NewNotePage() {
  const t = useTranslations("notes");
  const router = useRouter();
  const { settings } = useSettings();
  const locale = settings.locale;
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [hintsOpen, setHintsOpen] = useState(false);

  async function handleBack() {
    const content = blocksToMarkdown(blocks).trim();
    if (content || title.trim()) {
      await db.notes.add({
        title: title.trim() || t("untitled"),
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success(t("toastSaved"));
    }
    router.push("/notes");
  }

  async function handleSave() {
    const content = blocksToMarkdown(blocks).trim();
    if (!content && !title.trim()) {
      toast.error(t("toastNeedContent"));
      return;
    }
    await db.notes.add({
      title: title.trim() || t("untitled"),
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    toast.success(t("toastSaved"));
    router.push("/notes");
  }

  function handleVoiceResult(rawText: string) {
    const processed = processVoiceText(rawText, locale);
    const startsWithBreak = /^\n/.test(processed);
    const endsWithBreak = /\n$/.test(processed);
    const text = processed.replace(/^\n+/, "").replace(/\n+$/, "");
    const incoming = text ? markdownToBlocks(text) : [];

    setBlocks((current) => {
      const result = [...current];
      const last = result[result.length - 1];

      // "new line" with no other content
      if (incoming.length === 0) {
        if (startsWithBreak || endsWithBreak) {
          return [...result, { id: genId(), type: "text" as const, content: "" }];
        }
        return result;
      }

      // Replace the initial empty block
      if (result.length === 1 && last.type === "text" && last.content === "") {
        const newBlocks = incoming.map((b) => ({ ...b, id: genId() }));
        if (endsWithBreak) newBlocks.push({ id: genId(), type: "text" as const, content: "" });
        return newBlocks;
      }

      if (startsWithBreak) {
        // "new line …text" — don't merge with previous block
        result.push(...incoming.map((b) => ({ ...b, id: genId() })));
      } else {
        // Merge leading text into last text block
        const first = incoming[0];
        if (first.type === "text" && last.type === "text") {
          result[result.length - 1] = {
            ...last,
            content: last.content ? `${last.content} ${first.content}` : first.content,
          };
          result.push(...incoming.slice(1).map((b) => ({ ...b, id: genId() })));
        } else {
          result.push(...incoming.map((b) => ({ ...b, id: genId() })));
        }
      }

      if (endsWithBreak) {
        result.push({ id: genId(), type: "text" as const, content: "" });
      }

      return result;
    });
  }

  const plainText = blocksToPlainText(blocks);

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={handleBack} aria-label={t("backToNotes")} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex-1">{t("newTitle")}</h1>
        <button onClick={handleSave} aria-label={t("saveAria")}
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Save className="w-5 h-5" />
        </button>
      </header>

      <input
        type="text"
        placeholder={t("titlePlaceholderNew")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label={t("titleAria")}
        className="w-full bg-secondary rounded-xl px-4 py-3 text-xl font-semibold placeholder:text-muted-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      />

      <div className="flex-1 bg-secondary rounded-xl px-4 py-3 min-h-[12rem]">
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          placeholder={t("contentPlaceholderNew")}
        />
      </div>

      {plainText && <TTSButton text={plainText} label={t("readAloud")} />}

      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-muted-foreground text-sm">{t("tapToDictate")}</p>
        <VoiceInput onResult={handleVoiceResult} size="large" />
      </div>

      <div className="rounded-xl bg-secondary overflow-hidden">
        <button
          onClick={() => setHintsOpen((o) => !o)}
          aria-expanded={hintsOpen}
          aria-controls="voice-hints"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset min-h-[3rem]"
        >
          <span>{t("voiceCommands")}</span>
          {hintsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {hintsOpen && (
          <div id="voice-hints" className="px-4 pb-4 grid grid-cols-1 gap-2">
            {getVoiceCommandHints(locale).map(({ command, result }) => (
              <div key={command} className="flex items-center justify-between gap-4 text-sm">
                <code className="bg-background rounded-md px-2 py-1 font-mono text-foreground">{command}</code>
                <span className="text-muted-foreground">{result}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave}
        className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-xl active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-ring min-h-[4rem]">
        {t("saveButton")}
      </button>
    </div>
  );
}

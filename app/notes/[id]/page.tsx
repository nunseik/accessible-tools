"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/db";
import { VoiceInput } from "@/components/accessibility/VoiceInput";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { BlockEditor } from "@/components/notes/BlockEditor";
import { Block, blocksToMarkdown, blocksToPlainText, genId, markdownToBlocks } from "@/lib/noteBlocks";
import { processVoiceText, getVoiceCommandHints } from "@/lib/voiceCommands";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { settings } = useSettings();
  const locale = settings.locale;
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);

  useEffect(() => {
    db.notes.get(parseInt(id)).then((note) => {
      if (!note) { router.push("/notes"); return; }
      setTitle(note.title);
      setBlocks(markdownToBlocks(note.content));
      setLoaded(true);
    });
  }, [id, router]);

  async function handleSave() {
    await db.notes.update(parseInt(id), {
      title: title.trim() || "Untitled",
      content: blocksToMarkdown(blocks).trim(),
      updatedAt: new Date(),
    });
    toast.success("Note saved");
    router.push("/notes");
  }

  async function handleDelete() {
    await db.notes.delete(parseInt(id));
    if (navigator.vibrate) navigator.vibrate(100);
    toast.success("Note deleted");
    router.push("/notes");
  }

  function handleVoiceResult(rawText: string) {
    const processed = processVoiceText(rawText, locale);
    const incoming = markdownToBlocks(processed.replace(/^\n+/, ""));

    setBlocks((current) => {
      if (incoming.length === 0) return current;

      const result = [...current];
      const last = result[result.length - 1];
      const first = incoming[0];

      if (result.length === 1 && last.type === "text" && last.content === "") {
        return incoming.map((b) => ({ ...b, id: genId() }));
      }

      if (first.type === "text" && last.type === "text") {
        result[result.length - 1] = {
          ...last,
          content: last.content ? `${last.content} ${first.content}` : first.content,
        };
        result.push(...incoming.slice(1).map((b) => ({ ...b, id: genId() })));
      } else {
        result.push(...incoming.map((b) => ({ ...b, id: genId() })));
      }

      return result;
    });
  }

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-svh">
      <p className="text-muted-foreground">Loading…</p>
    </div>;
  }

  const plainText = blocksToPlainText(blocks);

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/notes" aria-label="Back to notes" className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">Edit Note</h1>
        <button onClick={handleDelete} aria-label="Delete note"
          className="p-3 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Trash2 className="w-5 h-5" />
        </button>
        <button onClick={handleSave} aria-label="Save note"
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Save className="w-5 h-5" />
        </button>
      </header>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Note title"
        className="w-full bg-secondary rounded-xl px-4 py-3 text-xl font-semibold placeholder:text-muted-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      />

      <div className="flex-1 bg-secondary rounded-xl px-4 py-3 min-h-[12rem]">
        <BlockEditor
          blocks={blocks}
          onChange={setBlocks}
          placeholder="Note content…"
        />
      </div>

      {plainText && <TTSButton text={plainText} label="Read note aloud" />}

      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-muted-foreground text-sm">Tap to dictate</p>
        <VoiceInput onResult={handleVoiceResult} size="large" />
      </div>

      <div className="rounded-xl bg-secondary overflow-hidden">
        <button
          onClick={() => setHintsOpen((o) => !o)}
          aria-expanded={hintsOpen}
          aria-controls="voice-hints"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset min-h-[3rem]"
        >
          <span>Voice commands</span>
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
        Save Note
      </button>
    </div>
  );
}

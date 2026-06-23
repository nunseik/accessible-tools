"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { VoiceInput } from "@/components/accessibility/VoiceInput";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { toast } from "sonner";

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    db.notes.get(parseInt(id)).then((note) => {
      if (!note) { router.push("/notes"); return; }
      setTitle(note.title);
      setContent(note.content);
      setLoaded(true);
    });
  }, [id, router]);

  async function handleSave() {
    await db.notes.update(parseInt(id), {
      title: title.trim() || "Untitled",
      content: content.trim(),
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

  function handleVoiceResult(text: string) {
    setContent((c) => (c ? c + " " + text : text));
  }

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-svh">
      <p className="text-muted-foreground">Loading…</p>
    </div>;
  }

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

      <textarea
        placeholder="Note content…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        aria-label="Note content"
        rows={8}
        className="w-full flex-1 bg-secondary rounded-xl px-4 py-3 text-xl placeholder:text-muted-foreground resize-none focus:outline-none focus-visible:ring-4 focus-visible:ring-ring leading-relaxed"
      />

      {content && <TTSButton text={content} label="Read note aloud" />}

      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-muted-foreground text-sm">Tap to dictate</p>
        <VoiceInput onResult={handleVoiceResult} size="large" />
      </div>

      <button onClick={handleSave}
        className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-xl active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-ring min-h-[4rem]">
        Save Note
      </button>
    </div>
  );
}

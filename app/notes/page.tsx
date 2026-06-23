"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { toast } from "sonner";

export default function NotesPage() {
  const notes = useLiveQuery(() =>
    db.notes.orderBy("updatedAt").reverse().toArray()
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (deleting !== id) {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
      return;
    }
    await db.notes.delete(id);
    if (navigator.vibrate) navigator.vibrate(100);
    toast.success("Note deleted");
    setDeleting(null);
  }

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" aria-label="Back to home" className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">Notes</h1>
        <Link href="/notes/new" aria-label="New note"
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      {(!notes || notes.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground text-lg">No notes yet.</p>
          <Link href="/notes/new"
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 font-bold text-xl active:scale-95 transition-transform">
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl leading-tight truncate">
                    {note.title || "Untitled"}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {note.content || "Empty note"}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(note.id!)}
                  aria-label={deleting === note.id ? "Tap again to confirm delete" : "Delete note"}
                  className={`p-3 rounded-xl min-h-[3rem] min-w-[3rem] transition-all flex items-center justify-center
                    ${deleting === note.id
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <TTSButton text={`${note.title}. ${note.content}`} label="Read note" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

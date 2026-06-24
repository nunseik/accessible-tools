import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id?: number;
  title: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  createdAt: Date;
}

export interface Settings {
  id: "singleton";
  fontSize: "normal" | "large" | "xlarge" | "huge";
  theme: "light" | "dark" | "high-contrast";
  speechRate: number;
  voiceURI: string;
  autoReadResults: boolean;
}

const db = new Dexie("AccessiTools") as Dexie & {
  notes: EntityTable<Note, "id">;
  recipes: EntityTable<Recipe, "id">;
  settings: EntityTable<Settings, "id">;
};

db.version(1).stores({
  notes: "++id, title, createdAt, updatedAt",
  recipes: "++id, title, createdAt",
  settings: "id",
});

db.version(2).stores({
  notes: "++id, title, createdAt, updatedAt",
  recipes: "++id, title, createdAt",
  settings: "id",
}).upgrade((tx) =>
  tx.table("settings").toCollection().modify((s) => {
    s.autoReadResults = false;
  })
);

db.on("populate", () => {
  db.settings.add({
    id: "singleton",
    fontSize: "large",
    theme: "light",
    speechRate: 0.9,
    voiceURI: "",
    autoReadResults: false,
  });
});

export { db };

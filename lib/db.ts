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
  source?: string;
}

export const EXAMPLE_RECIPES: Omit<Recipe, "id" | "createdAt">[] = [
  {
    title: "Chocolate Chip Cookies",
    servings: 36,
    source: "joyfoodsunshine.com",
    ingredients: [
      { amount: 1, unit: "cup", name: "salted butter, softened" },
      { amount: 1, unit: "cup", name: "granulated sugar" },
      { amount: 1, unit: "cup", name: "light brown sugar, packed" },
      { amount: 2, unit: "tsp", name: "vanilla extract" },
      { amount: 2, unit: "", name: "eggs" },
      { amount: 3, unit: "cup", name: "all-purpose flour" },
      { amount: 1, unit: "tsp", name: "baking soda" },
      { amount: 0.5, unit: "tsp", name: "baking powder" },
      { amount: 1, unit: "tsp", name: "sea salt" },
      { amount: 2, unit: "cup", name: "chocolate chips" },
    ],
    steps: [
      "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
      "Whisk flour, baking soda, baking powder, and salt together in a bowl. Set aside.",
      "Beat butter, granulated sugar, and brown sugar together until creamy and combined.",
      "Add eggs and vanilla. Beat for about 1 minute until light.",
      "Mix in the flour mixture until just combined, then fold in the chocolate chips.",
      "Roll 2 tablespoons of dough into balls and space 2 inches apart on prepared baking sheets.",
      "Bake 8–10 minutes until just barely golden at the edges. They should still look slightly underdone — that's the secret.",
      "Leave on the baking sheet for 5 minutes to set, then transfer to a wire rack.",
    ],
  },
  {
    title: "Classic Pancakes",
    servings: 8,
    source: "allrecipes.com",
    ingredients: [
      { amount: 1.5, unit: "cup", name: "all-purpose flour" },
      { amount: 3.5, unit: "tsp", name: "baking powder" },
      { amount: 1, unit: "tsp", name: "salt" },
      { amount: 1, unit: "tbsp", name: "sugar" },
      { amount: 1.25, unit: "cup", name: "milk" },
      { amount: 1, unit: "", name: "egg" },
      { amount: 3, unit: "tbsp", name: "melted butter" },
    ],
    steps: [
      "Whisk together flour, baking powder, salt, and sugar in a large bowl.",
      "Make a well in the center and add milk, egg, and melted butter. Mix until smooth.",
      "Heat a lightly buttered pan or griddle over medium-high heat.",
      "Pour ¼ cup of batter per pancake onto the pan.",
      "Cook until bubbles form on the surface and the edges look set, about 2–3 minutes.",
      "Flip and cook the other side until golden brown, about 1–2 more minutes.",
      "Serve immediately with your favourite toppings.",
    ],
  },
  {
    title: "Banana Bread",
    servings: 10,
    source: "allrecipes.com",
    ingredients: [
      { amount: 2, unit: "", name: "very ripe bananas, mashed" },
      { amount: 0.33, unit: "cup", name: "melted butter" },
      { amount: 0.75, unit: "cup", name: "sugar" },
      { amount: 1, unit: "", name: "egg, beaten" },
      { amount: 1, unit: "tsp", name: "vanilla extract" },
      { amount: 1, unit: "tsp", name: "baking soda" },
      { amount: 0.25, unit: "tsp", name: "salt" },
      { amount: 1.5, unit: "cup", name: "all-purpose flour" },
    ],
    steps: [
      "Preheat oven to 350°F (175°C). Butter a 4×8 inch loaf pan.",
      "Stir melted butter into the mashed bananas in a large bowl.",
      "Mix in sugar, beaten egg, and vanilla.",
      "Stir in baking soda and salt.",
      "Fold in flour until just combined — do not over-mix.",
      "Pour batter into the prepared loaf pan.",
      "Bake 55–65 minutes until a toothpick inserted in the centre comes out clean.",
      "Cool in the pan for a few minutes, then turn out onto a wire rack.",
    ],
  },
];

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
    s.autoReadResults = true;
  })
);

db.version(3).stores({
  notes: "++id, title, createdAt, updatedAt",
  recipes: "++id, title, createdAt",
  settings: "id",
}).upgrade((tx) =>
  tx.table("settings").toCollection().modify((s) => {
    s.autoReadResults = true;
  })
);

db.version(4).stores({
  notes: "++id, title, createdAt, updatedAt",
  recipes: "++id, title, createdAt",
  settings: "id",
}).upgrade(async (tx) => {
  const count = await tx.table("recipes").count();
  if (count === 0) {
    await tx.table("recipes").bulkAdd(
      EXAMPLE_RECIPES.map((r) => ({ ...r, createdAt: new Date() }))
    );
  }
});

db.on("populate", () => {
  db.settings.add({
    id: "singleton",
    fontSize: "large",
    theme: "light",
    speechRate: 0.9,
    voiceURI: "",
    autoReadResults: true,
  });
  db.recipes.bulkAdd(
    EXAMPLE_RECIPES.map((r) => ({ ...r, createdAt: new Date() }))
  );
});

export { db };

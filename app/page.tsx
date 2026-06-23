import Link from "next/link";
import { Calculator, NotebookPen, ChefHat, Ruler, Settings } from "lucide-react";

const TOOLS = [
  {
    href: "/calculator",
    icon: <Calculator className="w-12 h-12" />,
    label: "Calculator",
    description: "Standard, cooking & construction modes",
    color: "bg-blue-600 text-white",
  },
  {
    href: "/notes",
    icon: <NotebookPen className="w-12 h-12" />,
    label: "Notes",
    description: "Voice or typed notes with text-to-speech",
    color: "bg-emerald-600 text-white",
  },
  {
    href: "/recipes",
    icon: <ChefHat className="w-12 h-12" />,
    label: "Recipes",
    description: "Scale ingredients and cook hands-free",
    color: "bg-orange-500 text-white",
  },
  {
    href: "/converter",
    icon: <Ruler className="w-12 h-12" />,
    label: "Converter",
    description: "Cooking, length, weight & temperature",
    color: "bg-purple-600 text-white",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-svh p-4 gap-6">
      <header className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AccessiTools</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your accessible everyday toolkit
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Open settings"
          className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`
              ${tool.color} rounded-2xl p-5 flex flex-col items-start gap-3
              active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-ring
              min-h-[160px]
            `}
          >
            {tool.icon}
            <div>
              <div className="font-bold text-xl leading-tight">{tool.label}</div>
              <div className="text-sm opacity-85 mt-1 leading-snug">
                {tool.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        All data stored privately on your device
      </p>
    </main>
  );
}

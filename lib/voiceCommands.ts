import type { Locale } from "@/lib/db";

// Spoken dictation commands per locale. Order matters: the paragraph break must
// come before the line break so "new paragraph" doesn't match "new" in
// "new line". Recognition runs in the locale's language (see SPEECH_LANG), so
// the trigger phrases here are the words a speaker actually says in that
// language.
const COMMAND_MAPS: Record<Locale, [RegExp, string][]> = {
  en: [
    [/\b(?:new line|next line)\b/gi, "\n"],
    [/\b(?:checkbox|check box|checklist item|check item|to do item|todo item)\b/gi, "\n- [ ] "],
    [/\b(?:bullet point|new bullet)\b/gi, "\n- "],
  ],
  "pt-BR": [
    [/\b(?:nova linha|próxima linha)\b/gi, "\n"],
    [/\b(?:caixa de seleção|item de lista|item de tarefa|tarefa)\b/gi, "\n- [ ] "],
    [/\b(?:marcador|novo marcador|item de marcador)\b/gi, "\n- "],
  ],
  es: [
    [/\b(?:nueva línea|salto de línea)\b/gi, "\n"],
    [/\b(?:casilla|casilla de verificación|tarea|elemento de tarea)\b/gi, "\n- [ ] "],
    [/\b(?:viñeta|nueva viñeta|punto)\b/gi, "\n- "],
  ],
};

export function processVoiceText(text: string, locale: Locale = "en"): string {
  let result = text;
  for (const [pattern, replacement] of COMMAND_MAPS[locale] ?? COMMAND_MAPS.en) {
    result = result.replace(pattern, replacement);
  }
  return result
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/, "");
}

// Display hints shown in the "Voice commands" panel — the example phrase the
// user can say and what it produces, in each language.
const HINTS: Record<Locale, { command: string; result: string }[]> = {
  en: [
    { command: '"new line"', result: "line break" },
    { command: '"bullet point"', result: "• bullet item" },
    { command: '"checkbox"', result: "☐ to-do item" },
  ],
  "pt-BR": [
    { command: '"nova linha"', result: "quebra de linha" },
    { command: '"marcador"', result: "• item com marcador" },
    { command: '"tarefa"', result: "☐ item de tarefa" },
  ],
  es: [
    { command: '"nueva línea"', result: "salto de línea" },
    { command: '"viñeta"', result: "• elemento con viñeta" },
    { command: '"tarea"', result: "☐ elemento de tarea" },
  ],
};

export function getVoiceCommandHints(locale: Locale = "en") {
  return HINTS[locale] ?? HINTS.en;
}

// Cook-mode navigation keywords. handleVoiceCommand checks whether the
// recognized text includes any of these, so they must be in the spoken
// language.
const COOK_COMMANDS: Record<Locale, { next: string[]; back: string[]; repeat: string[] }> = {
  en: {
    next: ["next", "forward"],
    back: ["back", "previous"],
    repeat: ["repeat", "again"],
  },
  "pt-BR": {
    next: ["próximo", "próxima", "avançar", "seguinte"],
    back: ["voltar", "anterior"],
    repeat: ["repetir", "de novo", "novamente"],
  },
  es: {
    next: ["siguiente", "próximo", "adelante"],
    back: ["atrás", "anterior", "volver"],
    repeat: ["repetir", "otra vez", "de nuevo"],
  },
};

export function getCookCommands(locale: Locale = "en") {
  return COOK_COMMANDS[locale] ?? COOK_COMMANDS.en;
}

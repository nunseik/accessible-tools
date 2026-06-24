const COMMAND_MAP: [RegExp, string][] = [
  // Paragraph break first so "new paragraph" doesn't match "new" in "new line"
  [/\bnew paragraph\b/gi, '\n\n'],
  // Line breaks
  [/\bnew line\b/gi, '\n'],
  [/\bnext line\b/gi, '\n'],
  // Checklist items
  [/\b(?:checkbox|check box|checklist item|check item|to do item|todo item)\b/gi, '\n- [ ] '],
  // Bullets
  [/\b(?:bullet point|new bullet)\b/gi, '\n- '],
];

export function processVoiceText(text: string): string {
  let result = text;
  for (const [pattern, replacement] of COMMAND_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

export const VOICE_COMMAND_HINTS: { command: string; result: string }[] = [
  { command: '"new line"', result: 'line break' },
  { command: '"new paragraph"', result: 'paragraph break' },
  { command: '"bullet point"', result: '• bullet item' },
  { command: '"checkbox"', result: '☐ to-do item' },
  { command: '"checklist item"', result: '☐ to-do item' },
  { command: '"todo item"', result: '☐ to-do item' },
];

export function sanitizeUserText(text: string): string {
  if (!text) return text;
  let previous = "";
  let current = text;
  while (current !== previous) {
    previous = current;
    current = current.replace(/<\s*\/?\s*user_text[^>]*>/gi, "");
  }
  return current;
}

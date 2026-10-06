export function sanitizeUserText(text: string): string {
  if (!text) return text;
  return text.replace(/<\/?user_text>/gi, "");
}

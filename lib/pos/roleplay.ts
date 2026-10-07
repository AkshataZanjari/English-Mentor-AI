export function findCorrectedUserMessage(
  messages: { role: string; text: string }[],
  assistantIndex: number
): string | null {
  for (let i = assistantIndex - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i].text;
    }
  }
  return null;
}

export function shouldShowCorrection(
  correction: string | undefined | null,
  messages: { role: string; text: string }[],
  assistantIndex: number
): boolean {
  if (!correction) return false;
  const userText = findCorrectedUserMessage(messages, assistantIndex);
  if (!userText) return true;
  return correction.trim() !== userText.trim();
}

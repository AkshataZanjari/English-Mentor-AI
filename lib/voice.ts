export function joinTranscriptSegments(existing: string, incoming: string): string {
  if (!existing) return incoming;
  if (!incoming) return existing;

  const hasSpaceBefore = existing.match(/\s$/) !== null;
  const hasSpaceAfter = incoming.match(/^\s/) !== null;

  if (!hasSpaceBefore && !hasSpaceAfter) {
    return existing + " " + incoming;
  }
  return existing + incoming;
}

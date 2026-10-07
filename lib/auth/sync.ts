export function shouldSyncUser(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined,
  hasSynced: boolean
): boolean {
  return isLoaded && isSignedIn && !!userId && !hasSynced;
}

export function shouldSyncUser(
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined,
  syncedUserId: string | null
): boolean {
  return isLoaded && isSignedIn && !!userId && userId !== syncedUserId;
}

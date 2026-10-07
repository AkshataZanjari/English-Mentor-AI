import { expect, test, describe } from 'vitest';
import { shouldSyncUser } from '../lib/auth/sync';

describe('shouldSyncUser', () => {
  test('returns true when loaded, signed in, has userId, and not synced', () => {
    expect(shouldSyncUser(true, true, 'user_123', null)).toBe(true);
  });

  test('returns false when not loaded', () => {
    expect(shouldSyncUser(false, true, 'user_123', null)).toBe(false);
  });

  test('returns false when not signed in', () => {
    expect(shouldSyncUser(true, false, 'user_123', null)).toBe(false);
  });

  test('returns false when missing userId', () => {
    expect(shouldSyncUser(true, true, null, null)).toBe(false);
  });

  test('returns false when already synced for this user', () => {
    expect(shouldSyncUser(true, true, 'user_123', 'user_123')).toBe(false);
  });

  test('returns true when synced user is different', () => {
    expect(shouldSyncUser(true, true, 'user_123', 'user_456')).toBe(true);
  });
});

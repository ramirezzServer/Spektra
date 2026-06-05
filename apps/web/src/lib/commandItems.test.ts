import { describe, expect, it } from 'vitest';
import { commandItemDefinitions } from './commandItems';

describe('command items', () => {
  it('keeps command IDs unique', () => {
    const ids = commandItemDefinitions.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks protected commands as auth-only', () => {
    const protectedIds = commandItemDefinitions.filter((item) => item.authOnly).map((item) => item.id);

    expect(protectedIds).toEqual(expect.arrayContaining(['profile', 'create-list']));
  });
});

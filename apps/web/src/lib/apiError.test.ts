import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('api errors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps validation errors to the first friendly validation message', () => {
    expect(getApiErrorMessage({
      response: {
        status: 422,
        data: { errors: { email: ['Use a valid email address.'] } },
      },
    })).toBe('Use a valid email address.');
  });

  it('maps 429 into a friendly retry message', () => {
    expect(getApiErrorMessage({ response: { status: 429, data: {} } })).toBe('Too many attempts. Wait a moment and try again.');
  });

  it('maps offline state before generic network failures', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    expect(getApiErrorMessage({ code: 'ERR_NETWORK' })).toBe('You appear to be offline. Check your connection and try again.');
  });
});

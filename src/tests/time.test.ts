import { relativeTime } from '../utils/time';

const now = Math.floor(Date.now() / 1000);

describe('relativeTime', () => {
  it('returns "just now" for seconds ago', () => {
    expect(relativeTime(now - 30)).toBe('just now');
  });

  it('returns minutes ago', () => {
    expect(relativeTime(now - 120)).toBe('2 minutes ago');
  });

  it('uses singular for 1 minute', () => {
    expect(relativeTime(now - 65)).toBe('1 minute ago');
  });

  it('returns hours ago', () => {
    expect(relativeTime(now - 7200)).toBe('2 hours ago');
  });

  it('returns days ago', () => {
    expect(relativeTime(now - 86400 * 3)).toBe('3 days ago');
  });
});

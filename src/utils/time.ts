export function relativeTime(unix: number): string {
  const seconds = Math.floor(Date.now() / 1000) - unix;

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(seconds / 86400);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

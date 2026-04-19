export function parseDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    // Strip www. prefix
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

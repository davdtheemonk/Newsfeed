import type { Article } from '../types/Article';

const BASE = 'https://hacker-news.firebaseio.com/v0';

async function fetchTopIds(): Promise<number[]> {
  const res = await fetch(`${BASE}/topstories.json`);
  if (!res.ok) throw new Error('Failed to fetch story IDs');
  const ids: number[] = await res.json();
  return ids.slice(0, 20);
}

async function fetchItem(id: number): Promise<Article> {
  const res = await fetch(`${BASE}/item/${id}.json`);
  if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
  return res.json() as Promise<Article>;
}

export async function fetchTopStories(): Promise<Article[]> {
  const ids = await fetchTopIds();
  const items = await Promise.all(ids.map(fetchItem));

  return items.filter(item => item.type === 'story' && Boolean(item.url));
}

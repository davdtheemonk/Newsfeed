import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@newsfeed/bookmarks';

export async function loadBookmarks(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export async function saveBookmarks(ids: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  } catch {}
}

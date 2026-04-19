import { configureStore } from '@reduxjs/toolkit';
import articlesReducer from './articlesSlice';
import bookmarksReducer, { setBookmarks } from './bookmarkSlice';
import { loadBookmarks, saveBookmarks } from '../utils/storage';

export const store = configureStore({
  reducer: {
    articles: articlesReducer,
    bookmarks: bookmarksReducer,
  },
});

// Rehydrate bookmarks from AsyncStorage on startup
loadBookmarks().then(ids => {
  if (ids.length > 0) {
    store.dispatch(setBookmarks(ids));
  }
});

// Persist bookmarks to AsyncStorage whenever they change
let previousIds: number[] = [];
store.subscribe(() => {
  const currentIds = store.getState().bookmarks.bookmarkedIds;
  if (currentIds !== previousIds) {
    previousIds = currentIds;
    saveBookmarks(currentIds);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

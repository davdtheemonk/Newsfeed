import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

interface BookmarksState {
  bookmarkedIds: number[];
}

const initialState: BookmarksState = {
  bookmarkedIds: [],
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<number>) {
      if (!state.bookmarkedIds.includes(action.payload)) {
        state.bookmarkedIds.push(action.payload);
      }
    },
    removeBookmark(state, action: PayloadAction<number>) {
      state.bookmarkedIds = state.bookmarkedIds.filter(
        id => id !== action.payload,
      );
    },
    // Used only on startup for AsyncStorage rehydration
    setBookmarks(state, action: PayloadAction<number[]>) {
      state.bookmarkedIds = action.payload;
    },
  },
});

export const { addBookmark, removeBookmark, setBookmarks } =
  bookmarksSlice.actions;
export default bookmarksSlice.reducer;

// Curried selector — use as: selectIsBookmarked(id)(state)
export const selectIsBookmarked =
  (id: number) =>
  (state: RootState): boolean =>
    state.bookmarks.bookmarkedIds.includes(id);

export const selectBookmarkedIds = (state: RootState) =>
  state.bookmarks.bookmarkedIds;

export const selectAllBookmarkedArticles = (state: RootState) => {
  const ids = state.bookmarks.bookmarkedIds;
  return state.articles.articles.filter(a => ids.includes(a.id));
};

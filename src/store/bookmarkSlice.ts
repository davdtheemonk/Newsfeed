import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
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
export const selectIsBookmarked = (id: number) =>
  createSelector([selectBookmarkedIds], ids => ids.includes(id));
const selectBookmarkedIds = (state: RootState) => state.bookmarks.bookmarkedIds;
const selectArticles = (state: RootState) => state.articles.articles;

export const selectAllBookmarkedArticles = createSelector(
  [selectBookmarkedIds, selectArticles],
  (ids, articles) => articles.filter(article => ids.includes(article.id)),
);

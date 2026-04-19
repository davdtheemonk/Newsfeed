import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import type { Article, SortBy } from '../types/Article';
import { fetchTopStories } from '../utils/api';

interface ArticlesState {
  articles: Article[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  sortBy: SortBy;
}

const initialState: ArticlesState = {
  articles: [],
  status: 'idle',
  error: null,
  sortBy: 'score',
};

export const fetchArticles = createAsyncThunk<
  Article[],
  void,
  { rejectValue: string }
>('articles/fetch', async (_, { rejectWithValue }) => {
  try {
    return await fetchTopStories();
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchArticles.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'success';
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { setSortBy } = articlesSlice.actions;
export default articlesSlice.reducer;

// Memoised selector — returns sorted copy, never mutates state
export function selectSortedArticles(state: RootState): Article[] {
  const { articles, sortBy } = state.articles;
  return [...articles].sort((a, b) =>
    sortBy === 'score' ? b.score - a.score : b.time - a.time,
  );
}

import { useAppDispatch, useAppSelector } from '../store';
import {
  addBookmark,
  removeBookmark,
  selectIsBookmarked,
} from '../store/bookmarkSlice';
import { useCallback } from 'react';

interface UseBookmarkResult {
  isBookmarked: boolean;
  toggle: () => void;
}

export function useBookmark(articleId: number): UseBookmarkResult {
  const dispatch = useAppDispatch();
  const isBookmarked = useAppSelector(selectIsBookmarked(articleId));

  const toggle = useCallback(() => {
    if (isBookmarked) {
      dispatch(removeBookmark(articleId));
    } else {
      dispatch(addBookmark(articleId));
    }
  }, [dispatch, isBookmarked, articleId]);

  return { isBookmarked, toggle };
}

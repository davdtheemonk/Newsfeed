import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArticleCard from '../features/articles/ArticleCard';
import type { Article } from '../types/Article';

const mockArticle: Article = {
  id: 1,
  title: 'TypeScript 6.0 Released',
  url: 'https://typescriptlang.org/blog',
  by: 'deno_user',
  score: 420,
  time: Math.floor(Date.now() / 1000) - 3600,
  type: 'story',
};

describe('ArticleCard', () => {
  it('renders the article title', () => {
    const { getByText } = render(
      <ArticleCard article={mockArticle} onPress={jest.fn()} />,
    );
    expect(getByText('TypeScript 6.0 Released')).toBeTruthy();
  });

  it('calls onPress with the article when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <ArticleCard article={mockArticle} onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(mockArticle);
  });

  it('displays the score', () => {
    const { getByText } = render(
      <ArticleCard article={mockArticle} onPress={jest.fn()} />,
    );
    expect(getByText(/420/)).toBeTruthy();
  });
});

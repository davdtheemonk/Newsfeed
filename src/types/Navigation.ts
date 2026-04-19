import type { Article } from './Article';

export type RootStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { article: Article };
};

export type TabParamList = {
  Feed: undefined;
  Bookmarks: undefined;
};

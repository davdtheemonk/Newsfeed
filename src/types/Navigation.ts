import type { Article } from './Article';

export type RootStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { article: Article };
};

export type TabParamList = {
  Feed:
    | {
        screen: keyof RootStackParamList;
        params?: { article?: Article };
      }
    | undefined;
  Bookmarks: undefined;
};

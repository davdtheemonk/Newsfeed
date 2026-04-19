export interface Article {
  id: number;
  title: string;
  url: string;
  by: string;
  score: number;
  time: number; // Unix timestamp
  type: string;
}

export type SortBy = 'score' | 'time';

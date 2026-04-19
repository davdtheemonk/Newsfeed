import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchArticles,
  setSortBy,
  selectSortedArticles,
} from '../../store/articlesSlice';
import type { Article } from '../../types/Article';
import type { RootStackParamList } from '../../types/Navigation';
import ArticleCard from '../articles/ArticleCard';
import { useDebounce } from '../../hooks/useDebounce';

const CARD_HEIGHT = 100;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ArticleList'>;

export default function ArticleListScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();

  const { status, error, sortBy } = useAppSelector(state => state.articles);
  const sortedArticles = useAppSelector(selectSortedArticles);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Filter client-side from already-fetched articles
  const filtered =
    debouncedQuery.trim() === ''
      ? sortedArticles
      : sortedArticles.filter(
          article =>
            article.title
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            article.by.toLowerCase().includes(debouncedQuery.toLowerCase()),
        );

  const listRef = useRef<FlatList<Article>>(null);
  const scrollOffset = useRef(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollOffset.current > 0) {
        listRef.current?.scrollToOffset({
          offset: scrollOffset.current,
          animated: false,
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchArticles());
    }
  }, [dispatch, status]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const handleCardPress = useCallback(
    (article: Article) => navigation.navigate('ArticleDetail', { article }),
    [navigation],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Article> | null | undefined, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: Article) => item.id.toString(), []);

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard article={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  // Loading state — only on first load, not on refresh
  if (status === 'loading' && sortedArticles.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E65100" />
        <Text style={styles.loadingText}>Loading stories…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorText}>{error ?? 'Something went wrong.'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchArticles())}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories or authors…"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing" // iOS only
            autoCorrect={false}
            autoCapitalize="none"
          />
          {/* Android clear button */}
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort toggle */}
      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'score' && styles.sortBtnActive]}
          onPress={() => dispatch(setSortBy('score'))}
        >
          <Text
            style={[
              styles.sortBtnText,
              sortBy === 'score' && styles.sortBtnTextActive,
            ]}
          >
            Top
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'time' && styles.sortBtnActive]}
          onPress={() => dispatch(setSortBy('time'))}
        >
          <Text
            style={[
              styles.sortBtnText,
              sortBy === 'time' && styles.sortBtnTextActive,
            ]}
          >
            New
          </Text>
        </TouchableOpacity>

        {/* Result count — updates as user types */}
        {debouncedQuery.trim() !== '' && (
          <Text style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Empty search state */}
      {filtered.length === 0 && debouncedQuery.trim() !== '' ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            No results for "{debouncedQuery}"
          </Text>
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearSearch}>Clear search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={status === 'loading'}
              onRefresh={handleRefresh}
              tintColor="#E65100"
            />
          }
          // Dismiss keyboard when scrolling
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { paddingVertical: 8 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  errorIcon: { fontSize: 36, marginBottom: 12 },
  errorText: {
    color: '#c0392b',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 15, marginBottom: 12 },
  clearSearch: { color: '#E65100', fontSize: 14, fontWeight: '600' },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 0, // removes Android default padding
  },
  clearBtn: { fontSize: 14, color: '#aaa', paddingLeft: 8 },

  // Sort
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortBtnActive: { backgroundColor: '#E65100', borderColor: '#E65100' },
  sortBtnText: { fontSize: 13, color: '#666', fontWeight: '500' },
  sortBtnTextActive: { color: '#fff' },
  resultCount: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#888',
  },
});

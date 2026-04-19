import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  removeBookmark,
  selectAllBookmarkedArticles,
} from '../../store/bookmarkSlice';
import type { Article } from '../../types/Article';
import ArticleCard from '../articles/ArticleCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BookmarksScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const bookmarked = useAppSelector(selectAllBookmarkedArticles);

  const handlePress = useCallback(
    (article: Article) => navigation.navigate('ArticleDetail', { article }),
    [navigation],
  );

  const renderRightActions = useCallback(
    (id: number) => () =>
      (
        <View style={styles.deleteBox}>
          <Text style={styles.deleteText}>Remove</Text>
        </View>
      ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <Swipeable
        renderRightActions={renderRightActions(item.id)}
        onSwipeableOpen={() => dispatch(removeBookmark(item.id))}
      >
        <ArticleCard article={item} onPress={handlePress} />
      </Swipeable>
    ),
    [dispatch, handlePress, renderRightActions],
  );

  if (bookmarked.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>★</Text>
        <Text style={styles.emptyText}>No bookmarks yet.</Text>
        <Text style={styles.emptyHint}>
          Tap the star on any story to save it.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarked}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 40, color: '#E65100', marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptyHint: { fontSize: 13, color: '#888', textAlign: 'center' },
  deleteBox: {
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
  },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

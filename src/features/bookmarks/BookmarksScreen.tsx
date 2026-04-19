import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';

import {
  removeBookmark,
  selectAllBookmarkedArticles,
} from '../../store/bookmarkSlice';
import type { Article } from '../../types/Article';
import ArticleCard from '../articles/ArticleCard';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../types/Navigation';

type Nav = BottomTabNavigationProp<TabParamList>;

// Self-contained swipeable row
function SwipeToDelete({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const DELETE_THRESHOLD = -80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        // Only allow swiping left
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DELETE_THRESHOLD) {
          // Swipe far enough
          Animated.timing(translateX, {
            toValue: -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDelete());
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={swipeStyles.container}>
      <View style={swipeStyles.deleteBackground}>
        <Text style={swipeStyles.deleteText}>Remove</Text>
      </View>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: { position: 'relative' },
  deleteBackground: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: {
    color: '#c0392b',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default function BookmarksScreen() {
  const dispatch = useAppDispatch();
  const bookmarked = useAppSelector(selectAllBookmarkedArticles);
  const navigation = useNavigation<Nav>();

  const handlePress = useCallback(
    (article: Article) => {
      navigation.navigate('Feed', {
        screen: 'ArticleDetail',
        params: { article },
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <SwipeToDelete onDelete={() => dispatch(removeBookmark(item.id))}>
        <ArticleCard article={item} onPress={handlePress} />
      </SwipeToDelete>
    ),
    [dispatch, handlePress],
  );

  if (bookmarked.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔖</Text>
        <Text style={styles.emptyText}>No bookmarks yet.</Text>
        <Text style={styles.emptyHint}>
          Tap <Text style={styles.headerBtnText}>☆ </Text>on any story page to
          save it.
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
  headerBtnText: { fontSize: 20, color: '#E65100' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptyHint: { fontSize: 13, color: '#888', textAlign: 'center' },
});

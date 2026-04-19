import React, { useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Share,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/Navigation';
import { useBookmark } from '../../hooks/useBookmarks';
import { parseDomain } from '../../utils/domain';
import { relativeTime } from '../../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;

export default function ArticleDetailScreen({ route, navigation }: Props) {
  const { article } = route.params;
  const { isBookmarked, toggle } = useBookmark(article.id);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: `${article.title}\n\n${article.url}` });
    } catch {
      // User cancelled or share failed — no action needed
    }
  }, [article]);

  const handleOpenURL = useCallback(async () => {
    await Linking.openURL(article.url);
  }, [article.url]);

  // Set header buttons — must be inside useLayoutEffect to render before the screen mounts
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggle} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>{isBookmarked ? '★' : '☆'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}> ⤴</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isBookmarked, toggle, handleShare]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{article.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>by {article.by}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>▲ {article.score}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{relativeTime(article.time)}</Text>
      </View>

      <TouchableOpacity onPress={handleOpenURL} style={styles.urlRow}>
        <Text style={styles.urlText}>{parseDomain(article.url)}</Text>
        <Text style={styles.urlArrow}>🔗</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 30,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  meta: { fontSize: 13, color: '#888' },
  metaDot: { marginHorizontal: 6, color: '#ccc' },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 14,
  },
  urlText: { flex: 1, fontSize: 14, color: '#E65100', fontWeight: '500' },
  urlArrow: { fontSize: 16, color: '#E65100' },
  headerButtons: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 6 },
  headerBtnText: { fontSize: 20, color: '#E65100' },
});

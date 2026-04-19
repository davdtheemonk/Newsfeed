// src/features/articles/ArticleCard.tsx
import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { Article } from '../types/Article';
import { parseDomain } from '../utils/domain';
import { relativeTime } from '../utils/time';

interface Props {
  article: Article;
  onPress: (article: Article) => void;
}

const FAVICON_BASE = 'https://www.google.com/s2/favicons?sz=64&domain=';

function getDomainColor(domain: string): string {
  const colors = [
    '#E65100',
    '#1565C0',
    '#2E7D32',
    '#6A1B9A',
    '#AD1457',
    '#00695C',
    '#4527A0',
    '#C62828',
  ];
  const index = domain.charCodeAt(0) % colors.length;
  return colors[index];
}

interface FaviconProps {
  domain: string;
}

function Favicon({ domain }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const color = getDomainColor(domain);
  const letter = domain.charAt(0).toUpperCase();

  if (failed) {
    // Custom placeholder
    return (
      <View style={[styles.faviconPlaceholder, { backgroundColor: color }]}>
        <Text style={styles.faviconLetter}>{letter}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `${FAVICON_BASE}${domain}` }}
      style={styles.favicon}
      onError={() => setFailed(true)}
    />
  );
}

const ArticleCard = memo(({ article, onPress }: Props) => {
  const domain = parseDomain(article.url);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(article)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={article.title}
    >
      <View style={styles.row}>
        <Favicon domain={domain} />
        <View style={styles.meta}>
          <Text style={styles.domain} numberOfLines={1}>
            {domain}
          </Text>
          <Text style={styles.time}>{relativeTime(article.time)}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>▲ {article.score}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={3}>
        {article.title}
      </Text>
    </TouchableOpacity>
  );
});

ArticleCard.displayName = 'ArticleCard';
export default ArticleCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favicon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
  },
  faviconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faviconLetter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  meta: { flex: 1 },
  domain: { fontSize: 12, color: '#888', fontWeight: '500' },
  time: { fontSize: 11, color: '#aaa', marginTop: 1 },
  scorePill: {
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreText: { fontSize: 12, color: '#E65100', fontWeight: '600' },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 21,
  },
});

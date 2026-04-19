import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '../hooks/useNetinfo';

export default function OfflineBanner() {
  const { isConnected } = useNetInfo();
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!isConnected) {
        translateY.setValue(0);
        opacity.setValue(1);
      }
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isConnected ? -60 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isConnected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isConnected]);
  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }], opacity }]}
    >
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#c0392b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: { fontSize: 16 },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetInfo(): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Check current state immediately on mount
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    // Then keep listening for changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  return { isConnected };
}

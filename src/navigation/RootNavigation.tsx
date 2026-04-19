import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from '../types/Navigation';
import ArticleListScreen from '../features/articles/ArticleListScreen';
import ArticleDetailScreen from '../features/details/ArticleDetailScreen';
import BookmarksScreen from '../features/bookmarks/BookmarksScreen';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function ArticleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ArticleList"
        component={ArticleListScreen}
        options={{ title: 'Top Stories' }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: '' }} // Detail screen sets its own title via useLayoutEffect
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E65100',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Feed') {
            return (
              <Text style={{ fontSize: 20 }}>{focused ? '📰' : '🗞️'}</Text>
            );
          }
          return <Text style={{ fontSize: 20 }}>{focused ? '🔖' : '📑'}</Text>;
        },
      })}
    >
      <Tab.Screen name="Feed" component={ArticleStack} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
    </Tab.Navigator>
  );
}

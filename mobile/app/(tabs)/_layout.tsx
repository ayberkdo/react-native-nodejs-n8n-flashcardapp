import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#0969da',
        tabBarInactiveTintColor: '#57606a',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#d0d7de',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Gösterge Paneli',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="flashcard"
        options={{
          title: 'Flashcards',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'copy' : 'copy-outline'}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen name="flashcard/create" options={{ href: null }} /> 
      <Tabs.Screen name="flashcard/play" options={{ href: null }} />
    </Tabs>
  );
}

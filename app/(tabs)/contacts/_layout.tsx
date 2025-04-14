import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/utils/constants/Colors';
import { Tabs } from 'expo-router';
import React from 'react';


export default function ContactsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
    }}>
      <Tabs.Screen
        name="friend-list"
        options={{
          title: 'Bạn bè',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'body' : 'body-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="group-list"
        options={{
          title: 'Nhóm',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

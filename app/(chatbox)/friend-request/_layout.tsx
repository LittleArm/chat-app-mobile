import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function FriendRequestLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Đã nhận',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'mail' : 'mail-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sent"
        options={{
          title: 'Đã gửi',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'send' : 'send-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

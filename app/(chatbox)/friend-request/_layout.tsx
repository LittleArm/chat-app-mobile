import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function FriendRequestLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                    marginBottom: 4,
                },
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 6,
                    paddingTop: 4,
                    borderTopWidth: 0.5,
                    borderTopColor: "#ddd",
                    backgroundColor: "#ffffff",
                },
                tabBarActiveTintColor: "#42A5F5",
                tabBarInactiveTintColor: "#999",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Received',
                    tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'mail' : 'mail-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sent"
                options={{
                    title: 'Sent',
                    tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'send' : 'send-outline'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

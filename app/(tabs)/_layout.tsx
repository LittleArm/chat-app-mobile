import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#42A5F5", // Light blue header
                    height: 120,
                },
                headerTitleStyle: {
                    color: "#ffffff", // White title
                    fontWeight: "bold",
                    fontSize: 30,
                },
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
                    title: "Tin nhắn",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "chatbox" : "chatbox-outline"}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="contacts"
                options={{
                    title: "Bạn bè",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "person" : "person-outline"}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Cài đặt",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "settings" : "settings-outline"}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

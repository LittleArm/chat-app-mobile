import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/utils/constants/Colors";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                    borderTopWidth: 0,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    width: "100%",
                },
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
                    title: "Danh bạ",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "calendar" : "calendar-outline"}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Cá nhân",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "person" : "person-outline"}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
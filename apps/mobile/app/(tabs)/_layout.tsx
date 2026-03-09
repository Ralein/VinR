/**
 * Tab Layout — Bottom tab navigator with Midnight Gold theme
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
    return (
        <View style={styles.tabIcon}>
            <Text style={[styles.emoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
            <Text style={[styles.tabLabel, { color: focused ? colors.gold : colors.textGhost }]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="checkin"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Check-in" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="journey"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" label="Journey" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📓" label="Journal" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 24,
        marginBottom: 2,
    },
    tabLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 10,
        letterSpacing: 0.5,
    },
});

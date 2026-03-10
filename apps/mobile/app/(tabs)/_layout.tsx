/**
 * Tab Layout — Bottom tab navigator with Midnight Gold theme
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/theme';
import MiniPlayer from '../../components/media/MiniPlayer';

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
        <View style={styles.root}>
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
                {/* Flow-only screens — hidden from tab bar */}
                <Tabs.Screen name="loading" options={{ href: null }} />
                <Tabs.Screen name="emergency" options={{ href: null }} />
                <Tabs.Screen name="results" options={{ href: null }} />
                <Tabs.Screen name="notification-settings" options={{ href: null }} />
            </Tabs>
            {/* Persistent mini player above tab bar */}
            <MiniPlayer />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.void,
    },
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

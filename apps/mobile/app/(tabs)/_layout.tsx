/**
 * Tab Layout — Premium bottom tab navigator
 *
 * Replaces emoji icons with Lucide vector icons + animated indicator dot.
 * Glass tab bar with gold glow on active icon.
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, Heart, Map, BookOpen, User } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, fonts, spacing, glass } from '../../constants/theme';
import MiniPlayer from '../../components/media/MiniPlayer';

type TabIconProps = {
    label: string;
    focused: boolean;
    Icon: typeof Home;
};

function TabIcon({ Icon, label, focused }: TabIconProps) {
    const color = focused ? colors.gold : colors.textGhost;

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(focused ? 1.12 : 1, { stiffness: 200, damping: 18 }) }],
    }));

    return (
        <View style={styles.tabIcon}>
            <Animated.View style={animatedIconStyle}>
                {focused && (
                    <View style={styles.iconGlow} />
                )}
                <Icon
                    size={22}
                    color={color}
                    strokeWidth={focused ? 2.2 : 1.7}
                />
            </Animated.View>
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            {focused && <View style={styles.activeIndicator} />}
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
                        backgroundColor: 'rgba(10,13,24,0.97)',
                        borderTopColor: 'rgba(255,255,255,0.06)',
                        borderTopWidth: 1,
                        height: Platform.OS === 'ios' ? 88 : 68,
                        paddingTop: 10,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    },
                    tabBarShowLabel: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={Home} label="Home" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="checkin"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={Heart} label="Check-in" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="journey"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={Map} label="Journey" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="journal"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={BookOpen} label="Journal" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon Icon={User} label="Profile" focused={focused} />
                        ),
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
        gap: 3,
    },
    tabLabel: {
        fontFamily: fonts.body,
        fontSize: 10,
        letterSpacing: 0.4,
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gold,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
    },
    iconGlow: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${colors.gold}15`,
        top: -5,
        left: -5,
        zIndex: -1,
    },
});

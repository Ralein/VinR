/**
 * Tab Layout v3 — Floating glass pill tab bar
 *
 * Premium animated tab bar with:
 * - Frosted glass floating pill container
 * - Animated active icon: scale spring + gold glow halo
 * - Ink-dot indicator below active icon
 * - Morphing icon color with Reanimated derived values
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Heart, Map, BookOpen, User } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
    useDerivedValue,
    useSharedValue,
    useAnimatedProps,
} from 'react-native-reanimated';
import { colors, fonts, spacing } from '../../constants/theme';
import MiniPlayer from '../../components/media/MiniPlayer';

// ──────────────────── Animated Icon wrapper ────────────────────

type TabIconProps = {
    label: string;
    focused: boolean;
    Icon: typeof Home;
};

const AnimatedView = Animated.createAnimatedComponent(View);

function TabIcon({ Icon, label, focused }: TabIconProps) {
    const progress = useDerivedValue(() =>
        withTiming(focused ? 1 : 0, { duration: 220 })
    );

    const animatedWrapStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(focused ? 1.08 : 1, { stiffness: 260, damping: 20 }) },
        ],
    }));

    const haloStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
        transform: [{ scale: withSpring(focused ? 1 : 0.6, { stiffness: 200, damping: 18 }) }],
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0, { duration: 180 }),
        transform: [{ scaleX: withSpring(focused ? 1 : 0, { stiffness: 280, damping: 22 }) }],
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: withTiming(focused ? 1 : 0.45, { duration: 200 }),
        color: focused ? colors.gold : colors.textGhost,
    }));

    const color = focused ? colors.gold : colors.textGhost;
    const strokeWidth = focused ? 2.2 : 1.6;

    return (
        <View style={styles.tabItem}>
            <Animated.View style={[styles.halo, haloStyle]} />
            <Animated.View style={animatedWrapStyle}>
                <Icon size={22} color={color} strokeWidth={strokeWidth} />
            </Animated.View>
            <Animated.Text style={[styles.tabLabel, labelStyle]}>{label}</Animated.Text>
            <Animated.View style={[styles.activeDot, dotStyle]} />
        </View>
    );
}

// ──────────────────────── Layout ─────────────────────────────

export default function TabLayout() {
    return (
        <View style={styles.root}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: tabBarStyle,
                    tabBarShowLabel: false,
                    tabBarBackground: () => <View style={styles.tabBarBg} />,
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
                <Tabs.Screen name="immediate-relief" options={{ href: null }} />
            </Tabs>
            {/* Persistent mini player above tab bar */}
            <MiniPlayer />
        </View>
    );
}

const tabBarHeight = Platform.OS === 'ios' ? 84 : 68;

const tabBarStyle = {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: tabBarHeight,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: 'transparent',
} as const;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.void,
    },
    tabBarBg: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(9,12,22,0.96)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(212,168,83,0.10)',
        // Subtle top glow line
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 54,
        position: 'relative',
    },
    halo: {
        position: 'absolute',
        top: -6,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: `${colors.gold}12`,
        zIndex: 0,
    },
    tabLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 9.5,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    activeDot: {
        width: 18,
        height: 3,
        borderRadius: 2,
        backgroundColor: colors.gold,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 3,
    },
});

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD_BRIGHT = '#F2C84B';
const VOID = '#05040E';
const VOID_MID = '#0A0818';

const STREAK_COUNT = 12;
const STREAK_ANGLES = Array.from({ length: STREAK_COUNT }, (_, i) => i * (360 / STREAK_COUNT));
const WARP_DIST = Math.max(width, height) * 0.55;

// ─── Internal Components ──────────────────────────────────────────────────────

function WarpStreak({
    angleDeg,
    delay: d,
    isCore,
}: {
    angleDeg: number;
    delay: number;
    isCore: boolean;
}) {
    const p = useSharedValue(0);

    useEffect(() => {
        p.value = withDelay(
            d,
            withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: isCore
            ? interpolate(p.value, [0, 0.04, 0.55, 1], [0, 1, 0.7, 0])
            : interpolate(p.value, [0, 0.06, 0.6, 1], [0, 0.5, 0.3, 0]),
        transform: [
            { rotate: `${angleDeg}deg` },
            { translateX: WARP_DIST * p.value },
            { scaleX: interpolate(p.value, [0, 0.08, 1], [1, 6, 16]) },
        ],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: isCore ? 2.5 : 5,
                    height: isCore ? 1.2 : 2.5,
                    borderRadius: 2,
                    backgroundColor: isCore ? GOLD_BRIGHT : 'rgba(212,175,55,0.25)',
                    left: width / 2 - (isCore ? 1.25 : 2.5),
                    top: height / 2 - (isCore ? 0.6 : 1.25),
                },
                style,
            ]}
        />
    );
}

function AmbientBlob({
    color,
    size,
    top,
    left,
    right,
    delay: d,
}: {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
}) {
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(1, { duration: 800 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top,
                    left,
                    right,
                },
                style,
            ]}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OnboardingBackgroundProps {
    delay?: number;
    streakDelayOffset?: number;
}

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({
    delay = 0,
    streakDelayOffset = 8,
}) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[VOID, VOID_MID, VOID, VOID]}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />

            <LinearGradient
                colors={['rgba(123,94,248,0.05)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0.25 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Warp Field */}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak
                    key={`c${i}`}
                    angleDeg={a}
                    delay={delay + i * streakDelayOffset}
                    isCore={true}
                />
            ))}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak
                    key={`h${i}`}
                    angleDeg={a + 2}
                    delay={delay + i * streakDelayOffset + 30}
                    isCore={false}
                />
            ))}

            {/* Ambient Blobs */}
            <AmbientBlob
                color="rgba(212,175,55,0.05)"
                size={340}
                top={height * 0.1}
                left={-50}
                delay={delay + 50}
            />
            <AmbientBlob
                color="rgba(123,94,248,0.06)"
                size={280}
                top={height * 0.65}
                right={-60}
                delay={delay + 200}
            />
        </View>
    );
};

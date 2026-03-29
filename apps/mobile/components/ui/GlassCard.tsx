/**
 * GlassCard — Frosted glass surface component (upgraded)
 *
 * Midnight Gold glassmorphism card with optional accent borders,
 * shimmer border animation, pressable variant, and glow effect.
 */

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { glass, borderRadius, spacing, shadows, colors } from '../../constants/theme';

type AccentColor = 'gold' | 'emerald' | 'sapphire' | 'crimson' | 'lavender' | 'none';

const ACCENT_COLORS: Record<AccentColor, string> = {
    gold: colors.gold,
    emerald: colors.emerald,
    sapphire: colors.sapphire,
    crimson: colors.crimson,
    lavender: colors.lavender,
    none: 'rgba(255,255,255,0.07)',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
    children: React.ReactNode;
    accent?: AccentColor;
    /** Left accent border stripe */
    accentBorder?: boolean;
    /** Entrance animation delay in ms */
    delay?: number;
    /** Disable entrance animation */
    noAnimation?: boolean;
    /** Additional styles */
    style?: StyleProp<ViewStyle>;
    /** Use elevated shadow */
    elevated?: boolean;
    /** Animated shimmer border glow */
    shimmer?: boolean;
    /** Make card pressable with spring animation */
    onPress?: () => void;
    /** Colored drop shadow/glow using accent */
    glow?: boolean;
}

export default function GlassCard({
    children,
    accent = 'none',
    accentBorder = false,
    delay = 0,
    noAnimation = false,
    style,
    elevated = false,
    shimmer = false,
    onPress,
    glow = false,
}: GlassCardProps) {
    const accentHex = ACCENT_COLORS[accent];
    const shimmerOpacity = useSharedValue(0.1);
    const pressScale = useSharedValue(1);

    useEffect(() => {
        if (shimmer && accent !== 'none') {
            shimmerOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.45, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            );
        }
    }, [shimmer, accent]);

    const shimmerStyle = useAnimatedStyle(() => ({
        borderColor: accent !== 'none'
            ? `${accentHex}${Math.round(shimmerOpacity.value * 255).toString(16).padStart(2, '0')}`
            : glass.border,
    }));

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const handlePress = () => {
        if (!onPress) return;
        pressScale.value = withSequence(
            withSpring(0.97, { stiffness: 300, damping: 20 }),
            withSpring(1, { stiffness: 120, damping: 14 })
        );
        onPress();
    };

    const glowShadow = glow && accent !== 'none' ? {
        shadowColor: accentHex,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    } : {};

    const staticBorderColor = accent !== 'none'
        ? `${accentHex}40`
        : glass.border;

    const cardBaseStyle: ViewStyle = {
        backgroundColor: accent !== 'none' ? `${accentHex}06` : glass.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: staticBorderColor,
        overflow: 'hidden',
        ...(elevated ? shadows.card : {}),
        ...(glowShadow),
    };

    const inner = (
        <>
            {accentBorder && accent !== 'none' && (
                <View
                    style={[
                        styles.accentStripe,
                        { backgroundColor: `${accentHex}99` },
                    ]}
                />
            )}
            <View style={accentBorder ? styles.contentWithStripe : undefined}>
                {children}
            </View>
        </>
    );

    const wrappedContent = onPress ? (
        <AnimatedPressable
            onPress={handlePress}
            style={[cardBaseStyle, shimmer ? shimmerStyle : {}, pressStyle, style]}
        >
            {inner}
        </AnimatedPressable>
    ) : (
        <Animated.View style={[cardBaseStyle, shimmer ? shimmerStyle : {}, style]}>
            {inner}
        </Animated.View>
    );

    if (noAnimation) return wrappedContent;

    return (
        <Animated.View entering={FadeIn.delay(delay).duration(400)}>
            {wrappedContent}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        borderTopLeftRadius: borderRadius.lg,
        borderBottomLeftRadius: borderRadius.lg,
    },
    contentWithStripe: {
        paddingLeft: spacing.sm,
    },
});

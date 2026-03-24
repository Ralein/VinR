/**
 * NudgeCard — AI insight/recommendation card with animated gradient border
 *
 * Premium card with Lucide icon in a rounded square, gradient glow border,
 * title + message, and pressable navigation.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { type LucideIcon, ChevronRight } from 'lucide-react-native';
import { fonts, spacing, borderRadius, animation } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';

type NudgeAccent = 'gold' | 'emerald' | 'sapphire' | 'lavender' | 'crimson';

interface NudgeCardProps {
    title: string;
    message: string;
    Icon: LucideIcon;
    accent?: NudgeAccent;
    onPress?: () => void;
    delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NudgeCard({
    title,
    message,
    Icon,
    accent = 'gold',
    onPress,
    delay = 0,
}: NudgeCardProps) {
    const { colors, glass } = useTheme();

    const ACCENT_MAP: Record<NudgeAccent, string> = {
        gold: colors.gold,
        emerald: colors.emerald,
        sapphire: colors.sapphire,
        lavender: colors.lavender,
        crimson: colors.crimson,
    };

    const accentColor = ACCENT_MAP[accent];
    const scale = useSharedValue(1);
    const borderGlow = useSharedValue(0.2);

    useEffect(() => {
        // Subtle pulsing border glow
        borderGlow.value = withRepeat(
            withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, []);

    const animatedBorder = useAnimatedStyle(() => ({
        borderColor: `${accentColor}${Math.round(borderGlow.value * 255).toString(16).padStart(2, '0')}`,
    }));

    const animatedScale = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (!onPress) return;
        haptics.light();
        scale.value = withSequence(
            withSpring(0.97, animation.springStiff),
            withSpring(1, animation.spring)
        );
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(450).springify()}
            style={animatedScale}
        >
            <AnimatedPressable
                onPress={handlePress}
                disabled={!onPress}
                style={[
                    styles.card,
                    {
                        backgroundColor: `${accentColor}06`,
                        borderColor: colors.border
                    },
                    animatedBorder
                ]}
            >
                {/* Icon Column */}
                <View style={[styles.iconCol, { backgroundColor: `${accentColor}15` }]}>
                    <Icon size={22} color={accentColor} strokeWidth={2} />
                </View>
                {/* Text Column */}
                <View style={styles.textCol}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={2}>{message}</Text>
                </View>
                {/* Arrow */}
                {onPress && (
                    <ChevronRight size={16} color={colors.textGhost} strokeWidth={1.5} />
                )}
            </AnimatedPressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        marginBottom: spacing.sm,
    },
    iconCol: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textCol: {
        flex: 1,
        gap: 3,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 16,
        letterSpacing: 0.1,
    },
    message: {
        fontFamily: fonts.body,
        fontSize: 12,
        lineHeight: 17,
    },
});

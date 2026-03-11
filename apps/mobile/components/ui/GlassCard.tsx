/**
 * GlassCard — Frosted glass surface component
 *
 * Midnight Gold glassmorphism card with optional accent borders.
 * Accepts children and wraps them in a premium glass surface.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { glass, borderRadius, spacing, shadows } from '../../constants/theme';

type AccentColor = 'gold' | 'emerald' | 'sapphire' | 'crimson' | 'lavender' | 'none';

const ACCENT_COLORS: Record<AccentColor, string> = {
    gold: 'rgba(212,168,83,0.25)',
    emerald: 'rgba(78,203,160,0.25)',
    sapphire: 'rgba(74,144,217,0.25)',
    crimson: 'rgba(232,93,93,0.25)',
    lavender: 'rgba(139,126,200,0.25)',
    none: glass.border,
};

const ACCENT_BG: Record<AccentColor, string> = {
    gold: 'rgba(212,168,83,0.04)',
    emerald: 'rgba(78,203,160,0.04)',
    sapphire: 'rgba(74,144,217,0.04)',
    crimson: 'rgba(232,93,93,0.04)',
    lavender: 'rgba(139,126,200,0.04)',
    none: 'transparent',
};

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
}

export default function GlassCard({
    children,
    accent = 'none',
    accentBorder = false,
    delay = 0,
    noAnimation = false,
    style,
    elevated = false,
}: GlassCardProps) {
    const cardStyle: ViewStyle[] = [
        styles.card,
        { borderColor: ACCENT_COLORS[accent] },
        accent !== 'none' && { backgroundColor: `${glass.background}` },
        elevated && shadows.card,
    ].filter(Boolean) as ViewStyle[];

    const content = (
        <View style={[...cardStyle, style]}>
            {accentBorder && accent !== 'none' && (
                <View
                    style={[
                        styles.accentStripe,
                        { backgroundColor: ACCENT_COLORS[accent].replace('0.25', '0.6') },
                    ]}
                />
            )}
            <View style={accentBorder ? styles.contentWithStripe : undefined}>
                {children}
            </View>
        </View>
    );

    if (noAnimation) return content;

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(450).springify()}>
            {content}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: glass.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: glass.border,
        overflow: 'hidden',
    },
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

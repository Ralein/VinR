/**
 * GoldButton — Premium CTA button with gold glow
 *
 * Press scale animation, gold shadow halo, loading spinner,
 * disabled state. The primary action button for VinR.
 */

import React from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { colors, fonts, borderRadius, spacing, shadows, animation } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoldButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    /** Use emerald instead of gold */
    variant?: 'gold' | 'emerald' | 'ghost';
    /** Full-width button */
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function GoldButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    variant = 'gold',
    fullWidth = true,
    style,
}: GoldButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (disabled || loading) return;
        haptics.medium();
        scale.value = withSequence(
            withSpring(animation.pressScale, animation.springStiff),
            withSpring(1, animation.spring)
        );
        onPress();
    };

    const buttonColors = {
        gold: {
            bg: colors.gold,
            text: colors.void,
            shadow: shadows.gold,
        },
        emerald: {
            bg: colors.emerald,
            text: '#FFFFFF',
            shadow: shadows.emerald,
        },
        ghost: {
            bg: 'transparent',
            text: colors.textPrimary,
            shadow: {},
        },
    };

    const { bg, text, shadow } = buttonColors[variant];

    return (
        <AnimatedPressable
            onPress={handlePress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor: bg },
                shadow,
                variant === 'ghost' && styles.ghostButton,
                !fullWidth && styles.autoWidth,
                (disabled || loading) && styles.disabled,
                animatedStyle,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={text} size="small" />
            ) : (
                <Text style={[styles.label, { color: text }]}>{label}</Text>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.lg,
        paddingVertical: 18,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    autoWidth: {
        alignSelf: 'center',
    },
    ghostButton: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    disabled: {
        opacity: 0.45,
    },
    label: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
        letterSpacing: 0.3,
    },
});

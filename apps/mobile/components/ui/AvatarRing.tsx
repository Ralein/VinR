/**
 * AvatarRing — User avatar with animated gold ring
 *
 * Shows user initials in a circle with a glowing animated ring.
 * Supports image URL, initials fallback, and size variants.
 */

import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { fonts, spacing, animation } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface AvatarRingProps {
    size?: number;
    imageUri?: string;
    initials?: string;
    variant?: 'gold' | 'emerald' | 'sapphire';
    pulse?: boolean;
}

export default function AvatarRing({
    size = 48,
    imageUri,
    initials = 'VR',
    variant = 'gold',
    pulse = false,
}: AvatarRingProps) {
    const { colors } = useTheme();
    const ringSize = size + 8;
    const padding = 4;

    const ringColor = variant === 'gold' ? colors.gold :
                      variant === 'emerald' ? colors.emerald :
                      colors.sapphire;

    const pulseValue = useSharedValue(1);

    useEffect(() => {
        if (pulse) {
            pulseValue.value = withRepeat(
                withTiming(1.08, {
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true
            );
        } else {
            pulseValue.value = withTiming(1);
        }
    }, [pulse]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseValue.value }],
        opacity: 1,
    }));

    const innerSize = size - 4; // This calculation seems to be based on the original `size` prop

    return (
        <View style={[{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }]}>
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        backgroundColor: colors.surface,
                        borderColor: ringColor,
                    },
                    animatedStyle
                ]}
            >
                <View
                    style={{
                        width: innerSize,
                        height: innerSize,
                        borderRadius: innerSize / 2,
                        backgroundColor: colors.elevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
                        />
                    ) : (
                        // Fallback for initials, assuming it's still desired but not explicitly in the diff
                        // If initials are no longer needed, this block can be removed.
                        <Text
                            style={{
                                fontFamily: fonts.bodySemiBold,
                                fontSize: size * 0.33,
                                color: ringColor,
                                letterSpacing: 0.5,
                            }}
                        >
                            {initials.slice(0, 2).toUpperCase()}
                        </Text>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    ring: {
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

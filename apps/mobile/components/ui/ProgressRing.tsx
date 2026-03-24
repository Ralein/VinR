/**
 * ProgressRing — Animated SVG circular progress indicator
 *
 * Uses react-native-svg + react-native-reanimated for smooth
 * progress fill animation on mount. Premium gold/emerald/sapphire variants.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';


const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingVariant = 'gold' | 'emerald' | 'sapphire' | 'lavender';

interface ProgressRingProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    variant?: RingVariant;
    label?: string;
    sublabel?: string;
    showPercent?: boolean;
    animationDuration?: number;
}

export default function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 6,
    variant = 'gold',
    label,
    sublabel,
    showPercent = false,
    animationDuration = 1200,
}: ProgressRingProps) {
    const { colors, fonts } = useTheme();

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(clampedProgress, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
    }, [clampedProgress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    const VARIANT_COLORS: Record<RingVariant, [string, string]> = {
        gold: [colors.goldLight, colors.gold],
        emerald: ['#7EDFC0', colors.emerald],
        sapphire: ['#7AB5E8', colors.sapphire],
        lavender: ['#B0A8E0', colors.lavender],
    };

    const [colorLight, colorDark] = VARIANT_COLORS[variant];
    const gradientId = `ring-grad-${variant}`;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={colorLight} stopOpacity="1" />
                        <Stop offset="100%" stopColor={colorDark} stopOpacity="1" />
                    </SvgLinearGradient>
                </Defs>
                {/* Track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Animated Fill */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            {/* Center Label */}
            <View style={styles.centerLabel}>
                {showPercent && (
                    <Text style={[styles.percent, { fontFamily: fonts.bodySemiBold, color: VARIANT_COLORS[variant][1] }]}>
                        {Math.round(clampedProgress * 100)}%
                    </Text>
                )}
                {label && <Text style={[styles.label, { fontFamily: fonts.bodySemiBold, color: colors.textPrimary }]}>{label}</Text>}
                {sublabel && <Text style={[styles.sublabel, { fontFamily: fonts.bodyLight, color: colors.textMuted }]}>{sublabel}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    percent: {
        fontSize: 14,
    },
    label: {
        fontSize: 13,
        textAlign: 'center',
    },
    sublabel: {
        fontSize: 10,
        textAlign: 'center',
    },
});

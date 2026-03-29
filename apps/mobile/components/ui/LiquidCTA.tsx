import React, { useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CTA_W = width - 64;

export default function LiquidCTA({ 
    onPress, 
    label = "Begin Your Journey", 
    delay = 0 
}: { 
    onPress: () => void; 
    label?: string;
    delay?: number;
}) {
    const { colors, fonts } = useTheme();
    
    // Animations
    const borderOp  = useSharedValue(0);
    const glowOp    = useSharedValue(0);
    const fillW     = useSharedValue(0);
    const shimmerX  = useSharedValue(-80);
    const shimmerOp = useSharedValue(0);
    const labelOp   = useSharedValue(0);
    const labelSpc  = useSharedValue(3);
    const scale     = useSharedValue(1);

    useEffect(() => {
        borderOp.value  = withDelay(delay,        withTiming(1, { duration: 360 }));
        glowOp.value    = withDelay(delay + 200,  withTiming(1, { duration: 420 }));
        fillW.value     = withDelay(delay + 360,  withTiming(CTA_W, {
            duration: 600, easing: Easing.inOut(Easing.quad),
        }));
        shimmerOp.value = withDelay(delay + 380,  withTiming(1, { duration: 80 }));
        shimmerX.value  = withDelay(delay + 380,  withTiming(CTA_W + 80, {
            duration: 600, easing: Easing.inOut(Easing.quad),
        }));
        labelOp.value   = withDelay(delay + 980,  withTiming(1, { duration: 320 }));
        labelSpc.value  = withDelay(delay + 980,  withTiming(0.2, {
            duration: 300, easing: Easing.out(Easing.quad),
        }));
    }, [delay, CTA_W]);

    const borderStyle  = useAnimatedStyle(() => ({ opacity: borderOp.value }));
    const glowStyle    = useAnimatedStyle(() => ({ opacity: glowOp.value }));
    const fillStyle    = useAnimatedStyle(() => ({ width: fillW.value }));
    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: shimmerOp.value,
        transform: [{ translateX: shimmerX.value }],
    }));
    const labelStyle   = useAnimatedStyle(() => ({
        opacity: labelOp.value,
        letterSpacing: labelSpc.value,
    }));
    const pressStyle   = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.96, { stiffness: 400 }),
            withSpring(1, { stiffness: 300, damping: 15 })
        );
        onPress();
    };

    return (
        <AnimatedPressable onPress={handlePress} style={[styles.ctaOuter, pressStyle]}>
            {/* Outer glow */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaGlow, glowStyle, { shadowColor: colors.gold }]} />
            {/* Border */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaBorder, borderStyle, { borderColor: `${colors.gold}60` }]} />

            {/* Liquid fill */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                <Animated.View style={[{ height: '100%', backgroundColor: colors.gold }, fillStyle]}>
                    <LinearGradient
                        colors={[colors.goldLight, colors.gold, colors.goldMuted]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
                {/* Shimmer highlight */}
                <Animated.View style={[styles.ctaShimmer, shimmerStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            </View>
            {/* Label */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaLabelRow]}>
                <Animated.Text style={[styles.ctaText, labelStyle, { color: colors.void, fontFamily: fonts.bodySemiBold }]}>{label}</Animated.Text>
                <View style={[styles.ctaArrowCircle, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                    <Text style={[styles.ctaArrow, { color: colors.void }]}>›</Text>
                </View>
            </Animated.View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    ctaOuter: {
        width: CTA_W, 
        height: 64,
        borderRadius: 16,
        marginBottom: 14,
    },
    ctaGlow: {
        borderRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        backgroundColor: 'transparent',
    },
    ctaBorder: {
        borderRadius: 16,
        borderWidth: 1.5,
    },
    ctaShimmer: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: -80, width: 80,
    },
    ctaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24, gap: 12,
    },
    ctaText: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    ctaArrowCircle: {
        width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    ctaArrow: {
        fontSize: 24,
        lineHeight: 28,
        marginLeft: 1,
    },
});

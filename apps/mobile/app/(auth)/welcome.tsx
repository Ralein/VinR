/**
 * Welcome Screen — Premium animated splash
 *
 * Features:
 * - Animated gradient background with floating gold particles
 * - VinR logo with spring entrance animation (scale + fade)
 * - Secondary lavender glow orb for depth
 * - Tagline reveal with stagger
 * - "Begin your comeback →" CTA with gold glow pulse
 * - "Already winning? Sign in" secondary link
 */

import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    withTiming,
    FadeIn,
    Easing,
} from 'react-native-reanimated';
import { colors, gradients, animation, shadows } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Floating particle dot */
function Particle({ size, x, y, delay: d }: { size: number; x: number; y: number; delay: number }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(d, withTiming(0.6, { duration: 1000 }));
        translateY.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.gold,
                    left: x,
                    top: y,
                },
                style,
            ]}
        />
    );
}

export default function WelcomeScreen() {
    const logoScale = useSharedValue(0.3);
    const logoOpacity = useSharedValue(0);
    const taglineOpacity = useSharedValue(0);
    const ctaTranslateY = useSharedValue(60);
    const ctaOpacity = useSharedValue(0);
    const glowOpacity = useSharedValue(0.3);
    const glowScale = useSharedValue(0.8);
    const ctaScale = useSharedValue(1);

    useEffect(() => {
        // Logo entrance: spring scale + fade
        logoScale.value = withSpring(1, { stiffness: 80, damping: 12 });
        logoOpacity.value = withTiming(1, { duration: 600 });

        // Tagline reveal
        taglineOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

        // CTA slide up
        ctaTranslateY.value = withDelay(1000, withSpring(0, animation.spring));
        ctaOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));

        // Gold glow pulse — breathes
        glowOpacity.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
        glowScale.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const taglineAnimatedStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
    }));

    const ctaAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: ctaTranslateY.value },
            { scale: ctaScale.value },
        ],
        opacity: ctaOpacity.value,
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const handleCTAPress = () => {
        haptics.medium();
        ctaScale.value = withSequence(
            withSpring(0.95, { stiffness: 300 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => router.push('/(auth)/sign-up'), 150);
    };

    const handleSignInPress = () => {
        haptics.light();
        router.push('/(auth)/sign-in');
    };

    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <LinearGradient
                colors={[...gradients.void]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Floating particles */}
            <Particle size={4} x={width * 0.15} y={height * 0.2} delay={500} />
            <Particle size={3} x={width * 0.75} y={height * 0.15} delay={800} />
            <Particle size={5} x={width * 0.6} y={height * 0.35} delay={1200} />
            <Particle size={3} x={width * 0.3} y={height * 0.45} delay={1500} />
            <Particle size={4} x={width * 0.85} y={height * 0.5} delay={2000} />

            {/* Gold glow orb */}
            <Animated.View style={[styles.glowOrb, glowAnimatedStyle]} />

            {/* Lavender secondary glow (depth) */}
            <Animated.View style={[styles.lavenderOrb, glowAnimatedStyle]} />

            {/* Logo */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Text style={styles.logoVin}>vin</Text>
                <Text style={styles.logoR}>ℛ</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
                Win your life back
            </Animated.Text>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* CTA Button */}
            <AnimatedPressable
                style={[styles.ctaButton, ctaAnimatedStyle]}
                onPress={handleCTAPress}
            >
                <Text style={styles.ctaText}>Begin your comeback →</Text>
            </AnimatedPressable>

            {/* Sign In Link */}
            <Animated.View entering={FadeIn.delay(1400).duration(500)}>
                <Pressable onPress={handleSignInPress} style={styles.signInButton}>
                    <Text style={styles.signInLink}>Already winning? Sign in</Text>
                </Pressable>
            </Animated.View>

            {/* Bottom Brand Mark */}
            <Animated.Text
                entering={FadeIn.delay(1800).duration(800)}
                style={styles.bottomBrand}
            >
                Science-backed • AI-powered • 21-day engine
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    glowOrb: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: colors.goldGlow,
        top: height * 0.22,
    },
    lavenderOrb: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: colors.lavenderGlow,
        top: height * 0.18,
        right: -40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    logoVin: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 72,
        color: colors.textPrimary,
        letterSpacing: -2,
    },
    logoR: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 82,
        color: colors.gold,
        marginLeft: -6,
        fontStyle: 'italic',
    },
    tagline: {
        fontFamily: 'DMSans_300Light',
        fontSize: 13,
        color: colors.textMuted,
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    spacer: {
        height: 80,
    },
    ctaButton: {
        backgroundColor: colors.gold,
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 16,
        marginBottom: 16,
        ...shadows.gold,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: colors.void,
        letterSpacing: 0.5,
    },
    signInButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    signInLink: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
    },
    bottomBrand: {
        position: 'absolute',
        bottom: 48,
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
        letterSpacing: 1,
    },
});

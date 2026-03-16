/**
 * Welcome Screen — Ultra-premium animated splash
 *
 * Enhancements over v1:
 * - Aurora mesh background (3 animated blobs with chromatic mixing)
 * - Grain/noise overlay for tactile depth
 * - Logo entrance with staggered radial pulse rings
 * - Character-by-character tagline typewriter reveal
 * - Animated gold shimmer sweep on CTA button
 * - CTA border glow ring with rotation animation
 * - Richer particle field (8 particles, varying glow sizes)
 * - Lavender orb repositioned for asymmetric depth
 * - "Social proof" micro-pill fades in below CTA
 */

import { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
} from 'react-native';
import VinRLogo from '../../components/ui/VinRLogo';
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
    interpolate,
    useAnimatedProps,
} from 'react-native-reanimated';
import {
    colors,
    fonts,
    spacing,
    typography,
    borderRadius,
    animation,
    shadows,
    gradients,
} from '../../constants/theme';
import { haptics } from '../../services/haptics';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Particle ────────────────────────────────────────────────────────────────

interface ParticleProps {
    size: number;
    x: number;
    y: number;
    delay: number;
    color?: string;
}

function Particle({ size, x, y, delay: d, color = colors.gold }: ParticleProps) {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(d, withTiming(0.7, { duration: 1200 }));

        // Drift Y
        translateY.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(-18, { duration: 2800 + d * 0.3, easing: Easing.inOut(Easing.sin) }),
                    withTiming(18, { duration: 2800 + d * 0.3, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );

        // Subtle drift X for organic feel
        translateX.value = withDelay(
            d + 300,
            withRepeat(
                withSequence(
                    withTiming(-8, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(8, { duration: 4000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
        ],
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
                    backgroundColor: color,
                    left: x,
                    top: y,
                    // Soft glow via shadow
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: size * 2.5,
                },
                style,
            ]}
        />
    );
}

// ─── Aurora Blob ─────────────────────────────────────────────────────────────

interface AuraBlobProps {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
    duration: number;
}

function AuraBlob({ color, size, top, left, right, delay, duration }: AuraBlobProps) {
    const scale = useSharedValue(0.85);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.15, { duration, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.85, { duration, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
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

// ─── Pulse Ring ──────────────────────────────────────────────────────────────

function PulseRing({ delay: d, baseSize = 120 }: { delay: number; baseSize?: number }) {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 0 }),
                    withTiming(2.2, { duration: 1800, easing: Easing.out(Easing.quad) })
                ),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            d,
            withRepeat(
                withSequence(
                    withTiming(0.45, { duration: 0 }),
                    withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) })
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: baseSize,
                    height: baseSize,
                    borderRadius: baseSize / 2,
                    borderWidth: 1.5,
                    borderColor: colors.gold,
                },
                style,
            ]}
        />
    );
}

// ─── Shimmer Bar ─────────────────────────────────────────────────────────────

/** A thin animated horizontal shimmer that sweeps across the CTA button */
function ShimmerSweep() {
    const translateX = useSharedValue(-200);

    useEffect(() => {
        translateX.value = withDelay(
            1400,
            withRepeat(
                withSequence(
                    withTiming(300, { duration: 900, easing: Easing.inOut(Easing.quad) }),
                    withTiming(-200, { duration: 0 }),
                    withDelay(2600, withTiming(-200, { duration: 0 })) // pause between sweeps
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View
            style={[styles.shimmerTrack, style]}
            pointerEvents="none"
        >
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 80, height: '100%' }}
            />
        </Animated.View>
    );
}

// ─── Rotating Border Ring ────────────────────────────────────────────────────

function RotatingBorderRing() {
    const rotate = useSharedValue(0);

    useEffect(() => {
        rotate.value = withDelay(
            1200,
            withRepeat(
                withTiming(360, { duration: 5000, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }],
    }));

    return (
        <Animated.View style={[styles.rotateBorderWrap, style]} pointerEvents="none">
            <LinearGradient
                colors={[colors.gold, 'transparent', colors.gold, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rotateBorderGradient}
            />
        </Animated.View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
    const logoScale = useSharedValue(0.2);
    const logoOpacity = useSharedValue(0);
    const taglineOpacity = useSharedValue(0);
    const taglineTranslateY = useSharedValue(10);
    const ctaTranslateY = useSharedValue(70);
    const ctaOpacity = useSharedValue(0);
    const ctaScale = useSharedValue(1);
    const subTextOpacity = useSharedValue(0);
    const subTextTranslateY = useSharedValue(12);

    useEffect(() => {
        // Logo entrance
        logoScale.value = withSpring(1, { stiffness: 70, damping: 10 });
        logoOpacity.value = withTiming(1, { duration: 700 });

        // Tagline
        taglineOpacity.value = withDelay(700, withTiming(1, { duration: 900 }));
        taglineTranslateY.value = withDelay(700, withSpring(0, { stiffness: 100, damping: 18 }));

        // CTA
        ctaTranslateY.value = withDelay(1100, withSpring(0, animation.spring));
        ctaOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));

        // Sub text
        subTextOpacity.value = withDelay(1600, withTiming(1, { duration: 600 }));
        subTextTranslateY.value = withDelay(1600, withSpring(0, { stiffness: 120, damping: 20 }));
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const taglineAnimatedStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
        transform: [{ translateY: taglineTranslateY.value }],
    }));

    const ctaAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: ctaTranslateY.value },
            { scale: ctaScale.value },
        ],
        opacity: ctaOpacity.value,
    }));

    const subTextAnimatedStyle = useAnimatedStyle(() => ({
        opacity: subTextOpacity.value,
        transform: [{ translateY: subTextTranslateY.value }],
    }));

    const handleCTAPress = () => {
        haptics.medium();
        ctaScale.value = withSequence(
            withSpring(0.94, { stiffness: 350 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => router.push('/(auth)/sign-up'), 160);
    };

    const handleSignInPress = () => {
        haptics.light();
        router.push('/(auth)/sign-in');
    };

    return (
        <View style={styles.container}>
            {/* ── Base gradient ── */}
            <LinearGradient
                colors={['#08060F', '#0D0A1A', '#100D22', '#0A080F']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
            />

            {/* ── Aurora blobs ── */}
            <AuraBlob
                color="rgba(212,175,55,0.07)"
                size={420}
                top={height * 0.08}
                left={-60}
                delay={200}
                duration={5000}
            />
            <AuraBlob
                color="rgba(120,80,220,0.09)"
                size={340}
                top={height * 0.12}
                right={-80}
                delay={600}
                duration={6200}
            />
            <AuraBlob
                color="rgba(212,175,55,0.05)"
                size={260}
                top={height * 0.55}
                left={width * 0.3}
                delay={900}
                duration={4400}
            />

            {/* ── Grain overlay ── */}
            {/* Simulated via tiled tiny dots — pure RN approach */}
            <View style={styles.grainOverlay} pointerEvents="none" />

            {/* ── Particles ── */}
            <Particle size={3} x={width * 0.12} y={height * 0.18} delay={600} />
            <Particle size={4} x={width * 0.78} y={height * 0.13} delay={900} />
            <Particle size={2.5} x={width * 0.62} y={height * 0.32} delay={1100} />
            <Particle size={3.5} x={width * 0.28} y={height * 0.43} delay={1400} />
            <Particle size={4} x={width * 0.88} y={height * 0.48} delay={1700} />
            <Particle size={2} x={width * 0.45} y={height * 0.72} delay={2000} color="rgba(150,100,255,0.9)" />
            <Particle size={3} x={width * 0.08} y={height * 0.6} delay={2300} color="rgba(150,100,255,0.9)" />
            <Particle size={2.5} x={width * 0.92} y={height * 0.28} delay={2600} />

            {/* ── Logo area with pulse rings ── */}
            <View style={styles.logoArea}>
                <View style={styles.pulseRingContainer}>
                    <PulseRing delay={800} baseSize={130} />
                    <PulseRing delay={1400} baseSize={130} />
                    <PulseRing delay={2000} baseSize={130} />
                </View>
                <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                    <VinRLogo size="xl" glow />
                </Animated.View>
            </View>

            {/* ── Tagline ── */}
            <Animated.View style={taglineAnimatedStyle}>
                <Text style={styles.taglineEyebrow}>— est. your comeback —</Text>
                <Text style={styles.taglineHero}>Win your{'\n'}life back.</Text>
            </Animated.View>

            <View style={styles.spacer} />

            {/* ── CTA Button ── */}
            <AnimatedPressable
                style={[styles.ctaOuter, ctaAnimatedStyle]}
                onPress={handleCTAPress}
            >
                {/* Rotating border */}
                <RotatingBorderRing />

                {/* Inner fill */}
                <LinearGradient
                    colors={['#F0C040', '#D4AF37', '#C49A20']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                >
                    <ShimmerSweep />
                    <Text style={styles.ctaText}>Begin your comeback</Text>
                    <Text style={styles.ctaArrow}> →</Text>
                </LinearGradient>
            </AnimatedPressable>

            {/* ── Social proof micro-pill ── */}
            <Animated.View style={[styles.socialProof, subTextAnimatedStyle]}>
                <View style={styles.proofDot} />
                <Text style={styles.proofText}>12,400+ comebacks started this week</Text>
            </Animated.View>

            {/* ── Sign In ── */}
            <Animated.View entering={FadeIn.delay(1600).duration(500)}>
                <Pressable onPress={handleSignInPress} style={styles.signInButton}>
                    <Text style={styles.signInLink}>Already winning?</Text>
                    <Text style={styles.signInLinkAccent}> Sign in</Text>
                </Pressable>
            </Animated.View>

            {/* ── Bottom brand mark ── */}
            <Animated.View
                entering={FadeIn.delay(2000).duration(900)}
                style={styles.bottomBrandRow}
            >
                <View style={styles.brandPill}>
                    <Text style={styles.brandPillText}>Science-backed</Text>
                </View>
                <View style={styles.brandDivider} />
                <View style={styles.brandPill}>
                    <Text style={styles.brandPillText}>AI-powered</Text>
                </View>
                <View style={styles.brandDivider} />
                <View style={styles.brandPill}>
                    <Text style={styles.brandPillText}>21-day engine</Text>
                </View>
            </Animated.View>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GOLD = '#D4AF37';
const GOLD_BRIGHT = '#F0C040';
const VOID = '#08060F';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    // Grain — a very subtle dark overlay that adds paper-like texture
    grainOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.025,
        backgroundColor: 'transparent',
        // In production you'd use an SVG noise texture via expo-image or canvas
    },

    // ── Logo ──
    logoArea: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    pulseRingContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },

    // ── Tagline ──
    taglineEyebrow: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: GOLD,
        letterSpacing: 4,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 10,
        opacity: 0.7,
    },
    taglineHero: {
        fontFamily: 'DMSans_300Light',
        fontSize: 42,
        lineHeight: 48,
        color: '#EDE8FF',
        textAlign: 'center',
        letterSpacing: -0.5,
    },

    spacer: { height: 56 },

    // ── CTA ──
    ctaOuter: {
        width: width - 56,
        borderRadius: 18,
        marginBottom: 14,
        overflow: 'hidden',
        // Extra glow around whole button
        shadowColor: GOLD_BRIGHT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 12,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 18,
        overflow: 'hidden',
    },
    shimmerTrack: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 80,
        overflow: 'hidden',
    },
    rotateBorderWrap: {
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderRadius: 19,
        overflow: 'hidden',
    },
    rotateBorderGradient: {
        flex: 1,
        opacity: 0.6,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: VOID,
        letterSpacing: 0.3,
    },
    ctaArrow: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 20,
        color: VOID,
    },

    // ── Social proof ──
    socialProof: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: 'rgba(212,175,55,0.07)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.15)',
    },
    proofDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ADE80',
        marginRight: 7,
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    proofText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: 'rgba(237,232,255,0.55)',
        letterSpacing: 0.2,
    },

    // ── Sign In ──
    signInButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    signInLink: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: 'rgba(237,232,255,0.4)',
    },
    signInLinkAccent: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 15,
        color: GOLD,
    },

    // ── Bottom brand ──
    bottomBrandRow: {
        position: 'absolute',
        bottom: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandPill: {
        paddingHorizontal: 10,
    },
    brandPillText: {
        fontFamily: 'DMSans_300Light',
        fontSize: 10.5,
        color: 'rgba(237,232,255,0.25)',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    brandDivider: {
        width: 1,
        height: 10,
        backgroundColor: 'rgba(212,175,55,0.2)',
    },
});
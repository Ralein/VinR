import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withSequence,
    Easing,
    interpolate,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { fonts, spacing, animation } from '../../../constants/theme';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import PremiumLogo from '../../../components/ui/PremiumLogo';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../../services/haptics';
import { ChevronRight } from 'lucide-react-native';

const { height, width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_BRIGHT = '#F2C84B';
const GOLD_DIM = '#9A7B1A';
const VOID = '#05040E';
const VOID_MID = '#0A0818';
const PURPLE_ACCENT = '#7B5EF8';
const TEXT_HI = '#ECEAF6';
const TEXT_MID = 'rgba(236,234,246,0.52)';
const TEXT_LO = 'rgba(236,234,246,0.22)';

// ─── Warp Streak Component ────────────────────────────────────────────────────
const STREAK_COUNT = 20;
const STREAK_ANGLES = Array.from({ length: STREAK_COUNT }, (_, i) => i * (360 / STREAK_COUNT));
const WARP_DIST = Math.max(width, height) * 0.75;

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
            withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
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

// ─── Orbit Ring Component ─────────────────────────────────────────────────────
function OrbitRing({
    size,
    duration,
    delay: d,
    variant = 'primary',
}: {
    size: number;
    duration: number;
    delay: number;
    variant?: 'primary' | 'secondary';
}) {
    const rot = useSharedValue(0);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(1, { duration: 600 }));
        rot.value = withDelay(
            d,
            withTiming(360, { duration, easing: Easing.linear })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }],
        opacity: op.value,
    }));

    const ringStyle = variant === 'primary'
        ? {
            borderTopColor: 'rgba(212,175,55,0.6)',
            borderRightColor: 'rgba(212,175,55,0.15)',
            borderBottomColor: 'transparent',
            borderLeftColor: 'rgba(212,175,55,0.15)',
            borderWidth: 1,
        }
        : {
            borderTopColor: 'rgba(123,94,248,0.4)',
            borderRightColor: 'rgba(123,94,248,0.08)',
            borderBottomColor: 'transparent',
            borderLeftColor: 'rgba(123,94,248,0.08)',
            borderWidth: 0.75,
        };

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    ...ringStyle,
                },
                style,
            ]}
        />
    );
}

// ─── Premium Liquid CTA Button ────────────────────────────────────────────────
function LiquidCTA({ delay: d, onPress }: { delay: number; onPress: () => void }) {
    const CTA_W = width - 56;
    const borderOp = useSharedValue(0);
    const glowOp = useSharedValue(0);
    const fillW = useSharedValue(0);
    const shimmerX = useSharedValue(-80);
    const shimmerOp = useSharedValue(0);
    const labelOp = useSharedValue(0);
    const labelSpc = useSharedValue(3);
    const scale = useSharedValue(1);

    useEffect(() => {
        borderOp.value = withDelay(d, withTiming(1, { duration: 360 }));
        glowOp.value = withDelay(d + 200, withTiming(1, { duration: 420 }));
        fillW.value = withDelay(d + 360, withTiming(CTA_W, {
            duration: 600,
            easing: Easing.inOut(Easing.quad),
        }));
        shimmerOp.value = withDelay(d + 380, withTiming(1, { duration: 80 }));
        shimmerX.value = withDelay(d + 380, withTiming(CTA_W + 80, {
            duration: 600,
            easing: Easing.inOut(Easing.quad),
        }));
        labelOp.value = withDelay(d + 980, withTiming(1, { duration: 320 }));
        labelSpc.value = withDelay(d + 980, withTiming(0.2, {
            duration: 300,
            easing: Easing.out(Easing.quad),
        }));
    }, []);

    const borderStyle = useAnimatedStyle(() => ({ opacity: borderOp.value }));
    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));
    const fillStyle = useAnimatedStyle(() => ({ width: fillW.value }));
    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: shimmerOp.value,
        transform: [{ translateX: shimmerX.value }],
    }));
    const labelStyle = useAnimatedStyle(() => ({
        opacity: labelOp.value,
        letterSpacing: labelSpc.value,
    }));
    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.96, { stiffness: 400 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => onPress(), 150);
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            style={[styles.ctaOuter, pressStyle]}
        >
            {/* Outer glow */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaGlow, glowStyle]} />
            {/* Border */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaBorder, borderStyle]} />

            {/* Liquid fill */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                <Animated.View style={[{ height: '100%' }, fillStyle]}>
                    <LinearGradient
                        colors={[GOLD_BRIGHT, GOLD, '#C9981C']}
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
                <Animated.Text style={[styles.ctaText, labelStyle]}>
                    BEGIN YOUR JOURNEY
                </Animated.Text>
                <View style={styles.ctaArrowCircle}>
                    <Text style={styles.ctaArrow}>›</Text>
                </View>
            </Animated.View>
        </AnimatedPressable>
    );
}

// ─── Ambient Blob Component ───────────────────────────────────────────────────
function AmbientBlob({
    color,
    size,
    top,
    left,
    right,
    delay: d,
    duration,
}: {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
    duration: number;
}) {
    const scale = useSharedValue(0.85);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(1, { duration: 1200 }));
        scale.value = withDelay(
            d,
            withTiming(1.15, { duration, easing: Easing.inOut(Easing.sin) })
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Step1Welcome() {
    const { colors } = useTheme();
    const router = useRouter();

    // Logo animations
    const logoOp = useSharedValue(0);
    const logoScale = useSharedValue(0.8);

    // Quote animations
    const quoteOp = useSharedValue(0);
    const quoteY = useSharedValue(20);

    // Divider animations
    const dividerOp = useSharedValue(0);
    const dividerW = useSharedValue(0);

    // Tagline animations
    const tagline1Op = useSharedValue(0);
    const tagline2Op = useSharedValue(0);

    // CTA animations
    const ctaContainerOp = useSharedValue(0);

    useEffect(() => {
        logoOp.value = withDelay(200, withTiming(1, { duration: 500 }));
        logoScale.value = withDelay(200, withSpring(1, { stiffness: 90, damping: 15 }));

        quoteOp.value = withDelay(600, withTiming(1, { duration: 600 }));
        quoteY.value = withDelay(600, withSpring(0, { stiffness: 90, damping: 15 }));

        dividerOp.value = withDelay(1000, withTiming(1, { duration: 400 }));
        dividerW.value = withDelay(1000, withTiming(40, {
            duration: 400,
            easing: Easing.out(Easing.quad),
        }));

        tagline1Op.value = withDelay(1300, withTiming(1, { duration: 500 }));
        tagline2Op.value = withDelay(1500, withTiming(1, { duration: 500 }));

        ctaContainerOp.value = withDelay(2200, withTiming(1, { duration: 500 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOp.value,
        transform: [{ scale: logoScale.value }],
    }));

    const quoteStyle = useAnimatedStyle(() => ({
        opacity: quoteOp.value,
        transform: [{ translateY: quoteY.value }],
    }));

    const dividerStyle = useAnimatedStyle(() => ({
        opacity: dividerOp.value,
        width: dividerW.value,
    }));

    const tagline1Style = useAnimatedStyle(() => ({
        opacity: tagline1Op.value,
    }));

    const tagline2Style = useAnimatedStyle(() => ({
        opacity: tagline2Op.value,
    }));

    const ctaContainerStyle = useAnimatedStyle(() => ({
        opacity: ctaContainerOp.value,
    }));

    const handleNext = () => {
        router.push('/onboarding/step2-name');
    };

    const handleSignIn = () => {
        haptics.light();
        router.push('/(auth)/sign-in');
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.void }]}
            edges={['top', 'bottom']}
        >
            {/* ─── Background ─── */}
            <LinearGradient
                colors={[VOID, VOID_MID, VOID, VOID]}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />

            {/* Radial glow center */}
            <LinearGradient
                colors={['rgba(123,94,248,0.05)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: 0 }]}
                start={{ x: 0.5, y: 0.25 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* ─── Warp Field ─── */}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`c${i}`} angleDeg={a} delay={i * 15} isCore />
            ))}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`h${i}`} angleDeg={a + 2} delay={i * 15 + 50} isCore={false} />
            ))}

            {/* ─── Aurora Blobs ─── */}
            <AmbientBlob
                color="rgba(212,175,55,0.06)"
                size={420}
                top={height * 0.02}
                left={-80}
                delay={150}
                duration={5000}
            />
            <AmbientBlob
                color="rgba(123,94,248,0.08)"
                size={340}
                top={height * 0.68}
                right={-100}
                delay={400}
                duration={6000}
            />

            {/* ─── Main Content ─── */}
            <View style={styles.content}>
                {/* Hero Section with Logo */}
                <Animated.View style={[styles.heroSection, logoStyle]}>
                    <PremiumLogo delay={0} scale={1.1} />
                </Animated.View>

                {/* Quote Section */}
                <Animated.View style={[styles.quoteSection, quoteStyle]}>
                    <Animated.Text
                        style={[
                            styles.quote,
                            { color: colors.textPrimary },
                        ]}
                    >
                        "Mastery is the silent refinement of the soul."
                    </Animated.Text>

                    {/* Animated Divider */}
                    <Animated.View
                        style={[
                            styles.divider,
                            { backgroundColor: colors.gold },
                            dividerStyle,
                        ]}
                    />

                    {/* Taglines */}
                    <View style={styles.taglineReveal}>
                        <Animated.Text
                            style={[
                                styles.tagline,
                                { color: colors.textSecondary },
                                tagline1Style,
                            ]}
                        >
                            Welcome to your digital sanctuary.
                        </Animated.Text>
                        <Animated.Text
                            style={[
                                styles.tagline,
                                {
                                    color: colors.gold,
                                    fontFamily: fonts.bodySemiBold,
                                },
                                tagline2Style,
                            ]}
                        >
                            Exclusivity in every moment.
                        </Animated.Text>
                    </View>
                </Animated.View>

                {/* Spacer */}
                <View style={styles.spacer} />
            </View>

            {/* ─── CTA Section ─── */}
            <Animated.View style={[styles.ctaContainer, ctaContainerStyle]}>
                <LiquidCTA delay={2200} onPress={handleNext} />

                {/* Sign In Link */}

            </Animated.View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: height * 0.06,
    },

    // Quote
    quoteSection: {
        alignItems: 'center',
        marginBottom: height * 0.05,
    },
    quote: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 42,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.lg,
    },
    divider: {
        height: 1.5,
        marginBottom: spacing.lg,
        opacity: 0.7,
    },
    taglineReveal: {
        alignItems: 'center',
        gap: 6,
    },
    tagline: {
        fontFamily: fonts.body,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },

    spacer: {
        height: 20,
    },

    // CTA Section
    ctaContainer: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 60 : 80,
        alignItems: 'center',
    },

    ctaOuter: {
        width: width - 56,
        height: 60,
        borderRadius: 16,
        marginBottom: 20,
    },
    ctaGlow: {
        borderRadius: 16,
        shadowColor: GOLD_BRIGHT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 32,
        backgroundColor: 'transparent',
    },
    ctaBorder: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.38)',
    },
    ctaShimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -80,
        width: 80,
    },
    ctaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
    },
    ctaText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
        color: VOID,
        flex: 1,
        letterSpacing: 0.5,
    },
    ctaArrowCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaArrow: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 22,
        color: VOID,
        lineHeight: 26,
        marginLeft: 1,
    },

    // Sign in
    signInRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    signInBase: {
        fontFamily: fonts.body,
        fontSize: 14.5,
        color: TEXT_LO,
    },
    signInAccent: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14.5,
        color: GOLD,
    },
});
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useTheme } from '../../../context/ThemeContext';
import Animated, {
    FadeInDown,
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../../services/haptics';
import { animation } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_BRIGHT = '#F2C84B';
const VOID = '#05040E';
const VOID_MID = '#0A0818';
const PURPLE_ACCENT = '#7B5EF8';

// ─── Warp Streak Component ────────────────────────────────────────────────────
const STREAK_COUNT = 14;
const STREAK_ANGLES = Array.from({ length: STREAK_COUNT }, (_, i) => i * (360 / STREAK_COUNT));
const WARP_DIST = Math.max(width, height) * 0.6;

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
            withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
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

// ─── Ambient Blob Component ───────────────────────────────────────────────────
function AmbientBlob({
    color,
    size,
    top,
    left,
    right,
    delay: d,
}: {
    color: string;
    size: number;
    top: number;
    left?: number;
    right?: number;
    delay: number;
}) {
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withDelay(d, withTiming(1, { duration: 900 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
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

// ─── Premium Liquid CTA Button ────────────────────────────────────────────────
function LiquidCTA({
    delay: d,
    onPress,
    isDisabled,
}: {
    delay: number;
    onPress: () => void;
    isDisabled: boolean;
}) {
    const CTA_W = width - 56;
    const borderOp = useSharedValue(0);
    const glowOp = useSharedValue(0);
    const fillW = useSharedValue(0);
    const shimmerX = useSharedValue(-80);
    const shimmerOp = useSharedValue(0);
    const labelOp = useSharedValue(0);
    const labelSpc = useSharedValue(3);
    const scale = useSharedValue(1);
    const containerOp = useSharedValue(0);

    useEffect(() => {
        containerOp.value = withDelay(d, withTiming(1, { duration: 400 }));

        if (!isDisabled) {
            borderOp.value = withDelay(d + 150, withTiming(1, { duration: 360 }));
            glowOp.value = withDelay(d + 350, withTiming(1, { duration: 420 }));
            fillW.value = withDelay(d + 510, withTiming(CTA_W, {
                duration: 600,
                easing: Easing.inOut(Easing.quad),
            }));
            shimmerOp.value = withDelay(d + 530, withTiming(1, { duration: 80 }));
            shimmerX.value = withDelay(d + 530, withTiming(CTA_W + 80, {
                duration: 600,
                easing: Easing.inOut(Easing.quad),
            }));
            labelOp.value = withDelay(d + 1130, withTiming(1, { duration: 320 }));
            labelSpc.value = withDelay(d + 1130, withTiming(0.2, {
                duration: 300,
                easing: Easing.out(Easing.quad),
            }));
        } else {
            borderOp.value = withDelay(d + 150, withTiming(0.4, { duration: 300 }));
            glowOp.value = withDelay(d + 150, withTiming(0.2, { duration: 300 }));
            fillW.value = withDelay(d + 150, withTiming(CTA_W, { duration: 300 }));
            labelOp.value = withDelay(d + 150, withTiming(0.5, { duration: 300 }));
        }
    }, [isDisabled]);

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
    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOp.value,
    }));

    const handlePress = () => {
        if (isDisabled) return;
        haptics.medium();
        scale.value = withSequence(
            withSpring(0.96, { stiffness: 400 }),
            withSpring(1, animation.spring)
        );
        setTimeout(() => onPress(), 150);
    };

    return (
        <Animated.View style={containerStyle}>
            <AnimatedPressable
                onPress={handlePress}
                style={[styles.ctaOuter, pressStyle]}
                disabled={isDisabled}
            >
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaGlow, glowStyle]} />
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaBorder, borderStyle]} />

                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                    <Animated.View style={[{ height: '100%' }, fillStyle]}>
                        <LinearGradient
                            colors={
                                isDisabled
                                    ? [
                                        'rgba(212,175,55,0.1)',
                                        'rgba(212,175,55,0.05)',
                                        'rgba(212,175,55,0.02)',
                                    ]
                                    : [GOLD_BRIGHT, GOLD, '#C9981C']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                    {!isDisabled && (
                        <Animated.View style={[styles.ctaShimmer, shimmerStyle]}>
                            <LinearGradient
                                colors={[
                                    'transparent',
                                    'rgba(255,255,255,0.35)',
                                    'transparent',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    )}
                </View>

                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaLabelRow]}>
                    <Animated.Text
                        style={[
                            styles.ctaText,
                            {
                                color: isDisabled ? 'rgba(236,234,246,0.3)' : VOID,
                            },
                            labelStyle,
                        ]}
                    >
                        CONTINUE
                    </Animated.Text>
                </Animated.View>
            </AnimatedPressable>
        </Animated.View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Step3Age() {
    const { colors, fonts } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [age, setAge] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const titleY = useSharedValue(20);
    const subtitleOp = useSharedValue(0);
    const subtitleY = useSharedValue(20);
    const inputOp = useSharedValue(0);
    const inputY = useSharedValue(20);

    useEffect(() => {
        headerOp.value = withDelay(150, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(350, withTiming(1, { duration: 500 }));
        titleY.value = withDelay(350, withSpring(0, { stiffness: 90, damping: 15 }));
        subtitleOp.value = withDelay(550, withTiming(1, { duration: 500 }));
        subtitleY.value = withDelay(550, withSpring(0, { stiffness: 90, damping: 15 }));
        inputOp.value = withDelay(750, withTiming(1, { duration: 500 }));
        inputY.value = withDelay(750, withSpring(0, { stiffness: 90, damping: 15 }));
    }, []);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
        transform: [{ translateY: titleY.value }],
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOp.value,
        transform: [{ translateY: subtitleY.value }],
    }));

    const inputStyle = useAnimatedStyle(() => ({
        opacity: inputOp.value,
        transform: [{ translateY: inputY.value }],
    }));

    const handleNext = () => {
        if (age.length > 0 && isAgeValid) {
            router.push('/onboarding/step4-avatar');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.void }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* ─── Background Gradient ─── */}
            <LinearGradient
                colors={[VOID, VOID_MID, VOID, VOID]}
                style={StyleSheet.absoluteFill}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.75, y: 1 }}
            />

            <LinearGradient
                colors={['rgba(123,94,248,0.05)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: 0 }]}
                start={{ x: 0.5, y: 0.25 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* ─── Warp Field ─── */}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`c${i}`} angleDeg={a} delay={i * 10} isCore />
            ))}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`h${i}`} angleDeg={a + 2} delay={i * 10 + 35} isCore={false} />
            ))}

            {/* ─── Ambient Blobs ─── */}
            <AmbientBlob
                color="rgba(212,175,55,0.05)"
                size={360}
                top={height * 0.08}
                left={-60}
                delay={80}
            />
            <AmbientBlob
                color="rgba(123,94,248,0.06)"
                size={300}
                top={height * 0.62}
                right={-70}
                delay={250}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.flexFill}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ─── Header ─── */}
                        <Animated.View style={[styles.header, { marginTop: insets.top + 20 }, headerStyle]}>
                            <Pressable
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                            </Pressable>
                            <ProgressDots currentStep={3} totalSteps={9} />
                        </Animated.View>

                        {/* ─── Title ─── */}
                        <Animated.View style={[styles.titleSection, titleStyle]}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>
                                How old are you?
                            </Text>
                        </Animated.View>

                        {/* ─── Subtitle ─── */}
                        <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                VinR tailored experiences align with your stage of life.
                            </Text>
                        </Animated.View>

                        {/* ─── Input ─── */}
                        <Animated.View style={[styles.inputSection, inputStyle]}>
                            <GlassCard
                                accent={isFocused || isAgeValid ? 'gold' : undefined}
                                glow={isFocused}
                            >
                                <View style={styles.ageInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.gold,
                                                fontFamily: 'DMSans_700Bold',
                                            },
                                        ]}
                                        placeholder="00"
                                        placeholderTextColor={`${colors.gold}20`}
                                        value={age}
                                        onChangeText={(text) =>
                                            setAge(
                                                text
                                                    .replace(/[^0-9]/g, '')
                                                    .slice(0, 2)
                                            )
                                        }
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        autoFocus
                                        selectionColor={colors.gold}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                    />
                                    <Text
                                        style={[
                                            styles.yearsText,
                                            {
                                                color: colors.textSecondary,
                                                fontFamily: fonts.body,
                                            },
                                        ]}
                                    >
                                        years
                                    </Text>
                                </View>
                            </GlassCard>
                            {!isAgeValid && age.length === 2 && (
                                <Animated.View entering={FadeIn}>
                                    <Text style={[styles.errorText, { color: colors.crimson }]}>
                                        Must be 13 or older.
                                    </Text>
                                </Animated.View>
                            )}
                        </Animated.View>

                        <View style={{ flex: 1, minHeight: 40 }} />

                        {/* ─── CTA ─── */}
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                            <LiquidCTA
                                delay={1250}
                                onPress={handleNext}
                                isDisabled={!isAgeValid}
                            />
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flexFill: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 28,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    titleSection: {
        marginBottom: 16,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 36,
        lineHeight: 44,
    },
    subtitleSection: {
        marginBottom: 36,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    inputSection: {
        alignItems: 'center',
        marginTop: 8,
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 32,
        paddingVertical: 20,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 88,
        textAlign: 'center',
        minWidth: 100,
    },
    yearsText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 22,
        marginLeft: 12,
    },
    errorText: {
        marginTop: 16,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    footer: {
        width: '100%',
    },
    ctaOuter: {
        width: width - 56,
        height: 60,
        borderRadius: 16,
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
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        flex: 1,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
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
} from 'react-native-reanimated';
import {
    ArrowLeft,
    Check,
    User,
    Sun,
    Leaf,
    Gem,
    Flame,
    Waves,
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
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

// ─── Warp Streak Component ────────────────────────────────────────────────────
const STREAK_COUNT = 12;
const STREAK_ANGLES = Array.from({ length: STREAK_COUNT }, (_, i) => i * (360 / STREAK_COUNT));
const WARP_DIST = Math.max(width, height) * 0.55;

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
            withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
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
        op.value = withDelay(d, withTiming(1, { duration: 800 }));
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

const AVATARS = [
    { id: '1', icon: User, label: 'The Explorer' },
    { id: '2', icon: Sun, label: 'The Luminary' },
    { id: '3', icon: Leaf, label: 'The Naturalist' },
    { id: '4', icon: Gem, label: 'The Diamond' },
    { id: '5', icon: Flame, label: 'The Catalyst' },
    { id: '6', icon: Waves, label: 'The Serene' },
];

export default function Step4Avatar() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { avatarId, setAvatarId } = useOnboardingStore();

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const titleY = useSharedValue(20);
    const subtitleOp = useSharedValue(0);
    const subtitleY = useSharedValue(20);

    useEffect(() => {
        headerOp.value = withDelay(100, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(250, withTiming(1, { duration: 500 }));
        titleY.value = withDelay(250, withSpring(0, { stiffness: 90, damping: 15 }));
        subtitleOp.value = withDelay(400, withTiming(1, { duration: 500 }));
        subtitleY.value = withDelay(400, withSpring(0, { stiffness: 90, damping: 15 }));
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

    const handleNext = () => {
        if (avatarId) {
            router.push('/onboarding/step5-focus');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
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
                <WarpStreak key={`c${i}`} angleDeg={a} delay={i * 8} isCore />
            ))}
            {STREAK_ANGLES.map((a, i) => (
                <WarpStreak key={`h${i}`} angleDeg={a + 2} delay={i * 8 + 30} isCore={false} />
            ))}

            {/* ─── Ambient Blobs ─── */}
            <AmbientBlob
                color="rgba(212,175,55,0.05)"
                size={340}
                top={height * 0.1}
                left={-50}
                delay={50}
            />
            <AmbientBlob
                color="rgba(123,94,248,0.06)"
                size={280}
                top={height * 0.65}
                right={-60}
                delay={200}
            />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + (height > 800 ? 30 : 15),
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                {/* ─── Header ─── */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={4} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Define your identity
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Select an icon that reflects your essence within the VinR circle.
                    </Text>
                </Animated.View>

                {/* ─── Grid ─── */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {AVATARS.map((avatar, index) => {
                        const isSelected = avatarId === avatar.id;
                        const AvatarIcon = avatar.icon;
                        return (
                            <Animated.View
                                key={avatar.id}
                                entering={FadeInDown.duration(800)
                                    .delay(550 + index * 40)
                                    .springify()
                                    .damping(15)}
                                style={styles.avatarWrapper}
                            >
                                <Pressable
                                    onPress={() => {
                                        haptics.light();
                                        setAvatarId(avatar.id);
                                    }}
                                    style={({ pressed }) => [
                                        styles.avatarPressable,
                                        pressed && styles.avatarPressed,
                                    ]}
                                >
                                    <GlassCard
                                        accent={isSelected ? 'gold' : undefined}
                                        glow={isSelected}
                                    >
                                        <View style={styles.avatarCard}>
                                            {isSelected && (
                                                <Animated.View
                                                    entering={FadeIn.duration(300)}
                                                    style={[
                                                        styles.checkIcon,
                                                        { backgroundColor: colors.gold },
                                                    ]}
                                                >
                                                    <Check
                                                        size={12}
                                                        color={colors.void}
                                                        strokeWidth={4}
                                                    />
                                                </Animated.View>
                                            )}
                                            <AvatarIcon
                                                size={40}
                                                color={
                                                    isSelected
                                                        ? colors.gold
                                                        : colors.textGhost
                                                }
                                                strokeWidth={1.5}
                                            />
                                            <Text
                                                style={[
                                                    styles.label,
                                                    {
                                                        color: isSelected
                                                            ? colors.gold
                                                            : colors.textSecondary,
                                                    },
                                                    isSelected && styles.labelSelected,
                                                ]}
                                            >
                                                {avatar.label}
                                            </Text>
                                        </View>
                                    </GlassCard>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* ─── Footer ─── */}
                <View style={[styles.footer, { paddingTop: 20 }]}>
                    <LiquidCTA
                        delay={1350}
                        onPress={handleNext}
                        isDisabled={!avatarId}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleSection: {
        marginBottom: 12,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
    },
    subtitleSection: {
        marginBottom: 24,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    avatarWrapper: {
        width: '47%',
        marginBottom: 18,
    },
    avatarPressable: {
        width: '100%',
    },
    avatarPressed: {
        transform: [{ scale: 0.96 }],
    },
    avatarCard: {
        padding: 24,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    labelSelected: {
        fontFamily: 'DMSans_700Bold',
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
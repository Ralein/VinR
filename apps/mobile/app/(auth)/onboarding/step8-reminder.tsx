import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Platform,
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
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Bell, Calendar, Trophy } from 'lucide-react-native';
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

// ─── Premium Liquid CTA Button ────────────────────────────────────────────────
function LiquidCTA({
    delay: d,
    onPress,
    label,
}: {
    delay: number;
    onPress: () => void;
    label: string;
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

    React.useEffect(() => {
        containerOp.value = withDelay(d, withTiming(1, { duration: 400 }));

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
    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOp.value,
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
        <Animated.View style={containerStyle}>
            <AnimatedPressable
                onPress={handlePress}
                style={[styles.ctaOuter, pressStyle]}
            >
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaGlow, glowStyle]} />
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaBorder, borderStyle]} />

                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 16 }]}>
                    <Animated.View style={[{ height: '100%' }, fillStyle]}>
                        <LinearGradient
                            colors={[GOLD_BRIGHT, GOLD, '#C9981C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                    <Animated.View style={[styles.ctaShimmer, shimmerStyle]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                </View>
                <Animated.View style={[StyleSheet.absoluteFill, styles.ctaLabelRow]}>
                    <Animated.Text
                        style={[
                            styles.ctaText,
                            { color: VOID },
                            labelStyle,
                        ]}
                    >
                        {label}
                    </Animated.Text>
                    <ArrowRight size={20} color={VOID} />
                </Animated.View>
            </AnimatedPressable>
        </Animated.View>
    );
}

export default function Step8Reminder() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notificationsEnabled, setNotificationsEnabled } = useOnboardingStore();
    const [isEnabled, setIsEnabled] = useState(notificationsEnabled);

    const toggleSwitch = (value: boolean) => {
        setIsEnabled(value);
        setNotificationsEnabled(value);
    };

    const handleNext = () => {
        router.push('/onboarding/step9-finish');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground minimal={true} />
            <View style={[styles.content, { 
                paddingTop: insets.top + (height > 800 ? 40 : 20), 
                paddingBottom: insets.bottom + 20 
            }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={8} totalSteps={9} />

                    <Animated.View entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Maintain the rhythm
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            A soft nudge to keep you aligned with your standards. Reminders help anchor your daily discipline.
                        </Text>
                    </Animated.View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View
                        entering={FadeInDown.duration(1000).delay(600).springify().damping(15)}
                    >
                        <GlassCard accent={isEnabled ? 'gold' : undefined} glow={isEnabled} style={styles.card}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: isEnabled ? `${colors.gold}15` : colors.surface, borderColor: isEnabled ? colors.gold : colors.border }]}>
                                    <Bell size={32} color={isEnabled ? colors.gold : colors.textGhost} strokeWidth={1.5} />
                                </View>
                            </View>

                            <View style={styles.toggleRow}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Presence Notifications</Text>
                                    <Text style={[styles.toggleSub, { color: colors.textSecondary, opacity: 0.6 }]}>
                                        Receive a refined cue for your daily practice.
                                    </Text>
                                </View>
                                <Switch
                                    trackColor={{ false: colors.elevated, true: colors.gold }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : (isEnabled ? colors.textPrimary : colors.surface)}
                                    ios_backgroundColor={colors.elevated}
                                    onValueChange={toggleSwitch}
                                    value={isEnabled}
                                />
                            </View>

                            {isEnabled && (
                                <Animated.View entering={FadeIn.duration(400)} style={[styles.detailRow, { borderTopColor: colors.border }]}>
                                    <Calendar size={18} color={colors.gold} style={{ marginRight: 8 }} strokeWidth={2} />
                                    <Text style={[styles.detailText, { color: colors.gold }]}>Scheduled for 9:00 AM daily</Text>
                                </Animated.View>
                            )}
                        </GlassCard>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.duration(1000).delay(800).springify().damping(15)}
                    >
                        <GlassCard accent="gold">
                            <View style={styles.quoteBox}>
                                <Trophy size={20} color={colors.gold} style={styles.quoteIcon} strokeWidth={1.5} />
                                <Text style={[styles.quoteText, { color: colors.gold }]}>
                                    "Consistency is what transforms average into excellence."
                                </Text>
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: 20 }]}>
                    <LiquidCTA
                        label={isEnabled ? 'ENABLE & CONTINUE' : 'CONTINUE'}
                        delay={1000}
                        onPress={handleNext}
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
        marginBottom: 8,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
        marginTop: 32,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
    },
    card: {
        padding: 24,
        marginBottom: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    toggleTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
    },
    toggleSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
    },
    detailText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
    },
    quoteBox: {
        alignItems: 'center',
        padding: 24,
    },
    quoteIcon: {
        marginBottom: 12,
        opacity: 0.6,
    },
    quoteText: {
        fontFamily: 'DMSans_400Regular',
        fontStyle: 'italic',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    footer: {
        width: '100%',
        marginTop: 10,
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
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});

import React from 'react';
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
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
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

const COMMITMENTS = [
    { id: '1-2', label: '1-2 days / week', sub: 'The balanced introduction' },
    { id: '3-5', label: '3-5 days / week', sub: 'The path of discipline' },
    { id: 'daily', label: 'Every day', sub: 'The standard of excellence' },
];

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

    React.useEffect(() => {
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
                                colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
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
                        SET FREQUENCY
                    </Animated.Text>
                    <ArrowRight size={20} color={isDisabled ? 'rgba(236,234,246,0.3)' : VOID} />
                </Animated.View>
            </AnimatedPressable>
        </Animated.View>
    );
}

export default function Step7Frequency() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { dailyTime, setDailyTime } = useOnboardingStore();
    
    const handleNext = () => {
        if (dailyTime) {
            router.push('/onboarding/step8-reminder');
        }
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
                    <ProgressDots currentStep={7} totalSteps={9} />
                    
                    <Animated.View entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Define your pace
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Consistency is the bedrock of refinement. How often shall you dedicate yourself to VinR?
                        </Text>
                    </Animated.View>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {COMMITMENTS.map((item, index) => {
                        const isSelected = dailyTime === item.id;
                        return (
                            <Animated.View 
                                key={item.id}
                                entering={FadeInDown.duration(1000).delay(600 + index * 100).springify().damping(15)}
                                style={styles.optionWrapper}
                            >
                                <Pressable
                                    onPress={() => setDailyTime(item.id)}
                                    style={({ pressed }) => [
                                        styles.optionPressable,
                                        pressed && styles.optionPressed
                                    ]}
                                >
                                    <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                        <View style={styles.optionCard}>
                                            <View style={styles.optionInfo}>
                                                <Text style={[
                                                    styles.optionLabel,
                                                    { color: isSelected ? colors.gold : colors.textPrimary },
                                                    isSelected && styles.optionLabelSelected
                                                ]}>
                                                    {item.label}
                                                </Text>
                                                <Text style={[styles.optionSub, { color: colors.textSecondary, opacity: 0.6 }]}>
                                                    {item.sub}
                                                </Text>
                                            </View>
                                            
                                            <View style={[
                                                styles.radio,
                                                { borderColor: isSelected ? colors.gold : colors.border },
                                            ]}>
                                                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.gold }]} />}
                                            </View>
                                        </View>
                                    </GlassCard>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: 20 }]}>
                    <LiquidCTA
                        delay={1000}
                        onPress={handleNext}
                        isDisabled={!dailyTime}
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
    optionWrapper: {
        marginBottom: 16,
    },
    optionPressable: {
        width: '100%',
    },
    optionPressed: {
        transform: [{ scale: 0.985 }],
    },
    optionCard: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        marginBottom: 6,
    },
    optionLabelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    optionSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
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

/**
 * Step1Welcome — Onboarding welcome screen
 * 
 * Matches Journey/Loading screen design language:
 * - GlassCard for premium feel
 * - Orbital ring animations
 * - Ambient blobs for depth
 * - Lucide icons throughout
 * - Consistent spacing & typography
 */

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
    FadeInDown, 
    FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Shield, Zap } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { fonts, spacing, borderRadius } from '../../../constants/theme';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground, { OrbitRing, PulseRing } from '../../../components/ui/AmbientBackground';

export default function Step1Welcome() {
    const { colors } = useTheme();
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/step2-name');
    };

    const handleSignIn = () => {
        router.push('/(auth)/sign-in');
    };

    return (
        <SafeAreaView 
            style={[styles.container, { backgroundColor: colors.void }]} 
            edges={['top']}
        >
            <AmbientBackground />

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            >
                {/* ─── Hero Section ─── */}
                <Animated.View 
                    entering={FadeInUp.duration(900).springify().delay(200)} 
                    style={styles.heroSection}
                >
                    <View style={styles.iconZone}>
                        {/* Orbital rings */}
                        <OrbitRing size={140} duration={7000} delay={300} />
                        <OrbitRing size={180} duration={11000} delay={500} />

                        {/* Pulse halos */}
                        <PulseRing size={120} delay={700} />
                        <PulseRing size={150} delay={1200} />

                        {/* Icon container */}
                        <View style={[styles.iconContainer, { backgroundColor: `${colors.gold}12`, borderColor: `${colors.gold}25` }]}>
                            <LinearGradient
                                colors={[colors.gold, `${colors.gold}E8`]}
                                style={styles.iconGradient}
                            >
                                <Sparkles size={36} color={colors.void} strokeWidth={2} />
                            </LinearGradient>
                        </View>
                    </View>
                </Animated.View>

                {/* ─── Title Section ─── */}
                <Animated.View 
                    entering={FadeInDown.duration(800).delay(400).springify()}
                    style={styles.titleSection}
                >
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Welcome to <Text style={[styles.highlight, { color: colors.gold }]}>VinR</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        The most exclusive loyalty network for high-end experiences and refined tastes.
                    </Text>
                </Animated.View>

                {/* ─── Benefits Card ─── */}
                <Animated.View 
                    entering={FadeInDown.duration(800).delay(600).springify()}
                >
                    <GlassCard accent="gold" elevated noAnimation>
                        <View style={styles.benefitsGrid}>
                            {[
                                { Icon: Shield, label: 'Premium Security', desc: 'Bank-level encryption' },
                                { Icon: Zap, label: 'Instant Access', desc: 'Curated experiences' },
                            ].map((item, i) => (
                                <View key={i} style={styles.benefitItem}>
                                    <View style={[
                                        styles.benefitIconWrap, 
                                        { backgroundColor: `${colors.gold}15` }
                                    ]}>
                                        <item.Icon size={20} color={colors.gold} strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.benefitLabel, { color: colors.textPrimary }]}>
                                            {item.label}
                                        </Text>
                                        <Text style={[styles.benefitDesc, { color: colors.textMuted }]}>
                                            {item.desc}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* ─── CTA Button ─── */}
                <Animated.View 
                    entering={FadeInDown.duration(800).delay(800).springify()}
                    style={styles.ctaSection}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            { backgroundColor: colors.gold, shadowColor: colors.gold }
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={[styles.buttonText, { color: colors.void }]}>Enter Excellence</Text>
                        <ArrowRight size={18} color={colors.void} strokeWidth={2.5} />
                    </Pressable>

                    {/* Sign In Link */}
                    <Pressable onPress={handleSignIn} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                        <Text style={[styles.signInText, { color: colors.textMuted }]}>
                            Already a member? <Text style={[{ color: colors.gold, fontFamily: fonts.bodySemiBold }]}>Sign In</Text>
                        </Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    
    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconZone: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: 6,
        borderRadius: 36,
        borderWidth: 1,
    },
    iconGradient: {
        width: 84,
        height: 84,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },

    // Title
    titleSection: {
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 36,
        lineHeight: 44,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    highlight: {
        fontWeight: '900',
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: spacing.sm,
    },

    // Benefits
    benefitsGrid: {
        gap: spacing.md,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    benefitIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitLabel: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    benefitDesc: {
        fontFamily: fonts.body,
        fontSize: 13,
    },

    // CTA
    ctaSection: {
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    button: {
        height: 60,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    },
    buttonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        letterSpacing: 0.5,
    },
    signInText: {
        fontFamily: fonts.body,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
});
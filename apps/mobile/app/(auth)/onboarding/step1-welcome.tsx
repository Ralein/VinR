import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
    FadeInDown, 
    FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { fonts, spacing } from '../../../constants/theme';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import PremiumLogo from '../../../components/ui/PremiumLogo';
import LiquidCTA from '../../../components/ui/LiquidCTA';
import { haptics } from '../../../services/haptics';

const { height } = Dimensions.get('window');

export default function Step1Welcome() {
    const { colors } = useTheme();
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/step2-name');
    };

    const handleSignIn = () => {
        haptics.light();
        router.push('/(auth)/sign-in');
    };

    const handleSignUp = () => {
        haptics.light();
        router.push('/(auth)/sign-up');
    };

    return (
        <SafeAreaView 
            style={[styles.container, { backgroundColor: colors.void }]} 
            edges={['top', 'bottom']}
        >
            <AmbientBackground minimal={true} />

            <View style={styles.content}>
                {/* ─── Hero Section ─── */}
                <Animated.View 
                    entering={FadeIn.duration(1200).delay(200)} 
                    style={styles.heroSection}
                >
                    <PremiumLogo delay={400} scale={1.1} />
                </Animated.View>

                {/* ─── Quote Section ─── */}
                <Animated.View 
                    entering={FadeInDown.duration(1000).delay(1200).springify()}
                    style={styles.quoteSection}
                >
                    <Text style={[styles.quote, { color: colors.textPrimary }]}>
                        "Excellence is not an act, but a habit."
                    </Text>
                    <View style={[styles.divider, { backgroundColor: colors.gold }]} />
                    <View style={styles.taglineReveal}>
                        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                            Refinement in every detail. 
                        </Text>
                        <Text style={[styles.tagline, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                            Exclusivity in every experience.
                        </Text>
                    </View>
                </Animated.View>

                {/* ─── CTA Section ─── */}
                <View style={styles.bottomSection}>
                    <Animated.View 
                        entering={FadeInDown.duration(800).delay(2000).springify()}
                        style={styles.ctaAlign}
                    >
                        <LiquidCTA 
                            onPress={handleNext} 
                            label="Begin Your Journey" 
                            delay={2400} 
                        />

                        <View style={styles.authLinks}>
                            <Pressable onPress={handleSignUp} style={styles.authLink}>
                                <Text style={styles.authTextBase}>
                                    New here? <Text style={[styles.authTextHighlight, { color: colors.gold }]}>Sign Up</Text>
                                </Text>
                            </Pressable>
                            <View style={[styles.linkSeparator, { backgroundColor: colors.border }]} />
                            <Pressable onPress={handleSignIn} style={styles.authLink}>
                                <Text style={styles.authTextBase}>
                                    Member? <Text style={[styles.authTextHighlight, { color: colors.gold }]}>Sign In</Text>
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </SafeAreaView>
    );
}

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
        marginBottom: height * 0.05,
    },

    // Quote
    quoteSection: {
        alignItems: 'center',
        marginBottom: height * 0.08,
    },
    quote: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        lineHeight: 38,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: spacing.lg,
    },
    divider: {
        width: 40,
        height: 1.5,
        marginBottom: spacing.lg,
        opacity: 0.6,
    },
    taglineReveal: {
        alignItems: 'center',
        gap: 4,
    },
    tagline: {
        fontFamily: fonts.body,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },

    // Bottom
    bottomSection: {
        width: '100%',
    },
    ctaAlign: {
        alignItems: 'center',
    },
    authLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    authLink: {
        paddingHorizontal: 8,
    },
    authTextBase: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    authTextHighlight: {
        fontFamily: fonts.bodySemiBold,
    },
    linkSeparator: {
        width: 1,
        height: 14,
        opacity: 0.2,
    },
});
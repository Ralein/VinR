import React from 'react';
// Trigger refresh
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
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../../services/haptics';
import { ChevronRight } from 'lucide-react-native';

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
                    entering={FadeIn.duration(1000).delay(100)} 
                    style={styles.heroSection}
                >
                    <PremiumLogo delay={200} scale={1.2} />
                </Animated.View>

                {/* ─── Quote Section ─── */}
                <Animated.View 
                    entering={FadeInDown.duration(800).delay(600).springify()}
                    style={styles.quoteSection}
                >
                    <Text style={[styles.quote, { color: colors.textPrimary }]}>
                        "Mastery is the silent refinement of the soul."
                    </Text>
                    <View style={[styles.divider, { backgroundColor: colors.gold }]} />
                    <View style={styles.taglineReveal}>
                        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                            Welcome to your digital sanctuary.
                        </Text>
                        <Text style={[styles.tagline, { color: colors.gold, fontFamily: fonts.bodySemiBold }]}>
                            Exclusivity in every moment.
                        </Text>
                    </View>
                </Animated.View>

                {/* ─── CTA Section ─── */}
                <View style={styles.bottomSection}>
                    <Animated.View 
                        entering={FadeInDown.duration(800).delay(1000).springify()}
                        style={styles.ctaAlign}
                    >
                        <Pressable 
                            onPress={handleNext}
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.gold },
                                pressed && styles.buttonPressed
                            ]}
                        >
                            <LinearGradient
                                colors={[colors.goldLight, colors.gold, colors.gold]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <Text style={[styles.buttonText, { color: colors.void }]}>
                                BEGIN YOUR JOURNEY
                            </Text>
                            <ChevronRight size={20} color={colors.void} />
                        </Pressable>

                        
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
        marginTop: 20,
    },
    ctaAlign: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        overflow: 'hidden',
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    buttonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 18,
        letterSpacing: 0.5,
    },
    authLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
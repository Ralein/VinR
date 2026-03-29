import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import { AuthService } from '../../../services/auth';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ChevronRight, Check } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import PremiumCTA from '../../../components/ui/PremiumCTA';
import VinRLogo from '../../../components/ui/VinRLogo';

import PremiumLogo from '../../../components/ui/PremiumLogo';

const { width, height } = Dimensions.get('window');

export default function Step9Finish() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { name, focusAreas, completeOnboarding } = useOnboardingStore();
    const [saving, setSaving] = useState(false);

    const focusLabels = focusAreas.map(id => {
        switch(id) {
            case 'stress': return 'Stress Reduction';
            case 'focus': return 'Mental Focus';
            case 'self_care': return 'Daily Self-Care';
            case 'discipline': return 'Discipline';
            case 'productivity': return 'Productivity';
            case 'mindfulness': return 'Mindfulness';
            default: return id.replace('_', ' ');
        }
    });

    const handleFinish = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await AuthService.updateProfile({
                name: name || undefined,
                relaxationMethods: focusAreas,
                onboardingComplete: true,
            });
            completeOnboarding();
        } catch (error) {
            console.error('Failed to save onboarding:', error);
            completeOnboarding();
            router.replace('/(tabs)');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground minimal={false} />
            
            <View style={[styles.content, { 
                paddingTop: insets.top + (height > 800 ? 60 : 40), 
                paddingBottom: insets.bottom + 20 
            }]}>
                <View style={styles.logoContainer}>
                    <PremiumLogo />
                </View>
                
                <View style={styles.textContainer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Welcome to the Circle, {name}.
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.duration(1000).delay(600).springify().damping(15)}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Your personalized path is established. Precision and refinement await you within the VinR sanctuary.
                        </Text>
                    </Animated.View>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(1000).delay(800).springify().damping(15)}
                    style={styles.summaryWrapper}
                >
                    <GlassCard accent="gold" glow={true}>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryTitle, { color: colors.gold }]}>ESTABLISHED INTENT</Text>
                            <View style={styles.badgeContainer}>
                                {focusLabels.length > 0 ? (
                                    focusLabels.map((label, index) => (
                                        <View key={index} style={[styles.badge, { borderColor: `${colors.gold}30`, backgroundColor: `${colors.void}80` }]}>
                                            <Check size={12} color={colors.gold} style={{ marginRight: 8 }} strokeWidth={4} />
                                            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{label}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={[styles.summaryText, { color: colors.textPrimary }]}>Standard Excellence</Text>
                                )}
                            </View>
                        </View>
                    </GlassCard>
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(1000).springify()}>
                        <Pressable 
                            onPress={handleFinish}
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.gold },
                                pressed && styles.buttonPressed
                            ]}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={[colors.goldLight, colors.gold, colors.gold]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {saving ? (
                                <ActivityIndicator color={colors.void} />
                            ) : (
                                <>
                                    <Text style={[styles.buttonText, { color: colors.void }]}>
                                        ENTER YOUR SANCTUARY
                                    </Text>
                                    <ChevronRight size={20} color={colors.void} />
                                </>
                            )}
                        </Pressable>
                    </Animated.View>
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
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    logoContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 10,
    },
    summaryWrapper: {
        width: '100%',
        marginBottom: 'auto',
    },
    summaryCard: {
        padding: 24,
        alignItems: 'center',
    },
    summaryTitle: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 20,
        opacity: 0.7,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
    },
    summaryText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 16,
    },
    footer: {
        width: '100%',
        marginTop: 20,
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    buttonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
});

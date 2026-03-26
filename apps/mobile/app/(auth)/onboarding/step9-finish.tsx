import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { AuthService } from '../../../services/auth';
import Animated, { FadeInDown, FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Step9Finish() {
    const router = useRouter();
    const { name, age, focusAreas, completeOnboarding } = useOnboardingStore();
    const [saving, setSaving] = useState(false);

    const focusLabels = focusAreas.map(id => {
        switch(id) {
            case 'anxiety': return 'Reduced Anxiety';
            case 'focus': return 'Better Focus';
            case 'sleep': return 'Deep Sleep';
            case 'growth': return 'Personal Growth';
            default: return id;
        }
    });

    const handleFinish = async () => {
        if (saving) return;
        setSaving(true);
        try {
            // Persist onboarding data + mark complete on the backend
            await AuthService.updateProfile({
                name: name || undefined,
                age: age || undefined,
                primaryReason: focusAreas[0] || undefined,
                relaxationMethods: focusAreas,
                onboardingComplete: true,
            });
            // Mark complete in local onboarding store
            completeOnboarding();
            // RootNavigator will auto-redirect to (tabs) when user.onboardingComplete becomes true
        } catch (error) {
            console.error('Failed to save onboarding:', error);
            // Even if API fails, let them through — data is saved locally
            completeOnboarding();
            router.replace('/(tabs)');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.gradients.void}
                style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.content}>
                <Animated.View 
                    entering={ZoomIn.duration(1000).springify()}
                    style={styles.celebrationContainer}
                >
                    <View style={styles.circle}>
                        <Ionicons name="sparkles" size={48} color={theme.colors.gold} />
                    </View>
                    <View style={styles.glow} />
                </Animated.View>
                
                <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                    <Text style={styles.title}>You're all set, {name}!</Text>
                    <Text style={styles.subtitle}>
                        Your personalized path is ready. Let's begin your journey to a calmer mind.
                    </Text>
                </Animated.View>

                <Animated.View 
                    entering={FadeInUp.delay(800).duration(800)}
                    style={styles.summaryCard}
                >
                    <LinearGradient
                        colors={[theme.colors.elevated, theme.colors.surface]}
                        style={styles.cardGradient}
                    >
                        <Text style={styles.summaryTitle}>Core Focus</Text>
                        <View style={styles.badgeContainer}>
                            {focusLabels.length > 0 ? (
                                focusLabels.map((label, index) => (
                                    <View key={index} style={styles.badge}>
                                        <View style={styles.dot} />
                                        <Text style={styles.badgeText}>{label}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.summaryText}>Balance & Clarity</Text>
                            )}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <Animated.View entering={FadeInDown.delay(1200)}>
                    <Pressable
                        style={[styles.button, saving && { opacity: 0.7 }]}
                        onPress={handleFinish}
                        disabled={saving}
                    >
                        <LinearGradient
                            colors={[theme.colors.gold, theme.colors.goldLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={theme.colors.void} />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Enter Your Sanctuary</Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.void} />
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.void,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    celebrationContainer: {
        marginBottom: 40,
        position: 'relative',
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderGold,
        zIndex: 1,
    },
    glow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: theme.colors.gold,
        opacity: 0.1,
        top: -20,
        left: -20,
    },
    title: {
        ...theme.typography.h1,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    summaryCard: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
    },
    summaryTitle: {
        ...theme.typography.label,
        color: theme.colors.gold,
        marginBottom: 16,
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
        backgroundColor: theme.colors.void,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.gold,
        marginRight: 8,
    },
    badgeText: {
        ...theme.typography.bodySm,
        color: theme.colors.textPrimary,
    },
    summaryText: {
        ...theme.typography.body,
        color: theme.colors.textPrimary,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    button: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        ...theme.typography.bodySemiBold,
        color: theme.colors.void,
        fontSize: 18,
    },
});


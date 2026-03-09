/**
 * Onboarding Step 4 — "Let VinR check on you daily"
 *
 * Notification toggle switch + time picker.
 * Preview card showing mock notification with user's name.
 * "Finish setup →" gold CTA → marks onboarding complete → navigates to (tabs).
 * "Skip for now" secondary link.
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, animation } from '../../../constants/theme';
import { haptics } from '../../../services/haptics';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useAuthStore } from '../../../stores/authStore';
import { ProgressDots } from '../../../components/ui/ProgressDots';

const TIMES = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
];

const TIME_LABELS: Record<string, string> = {
    '06:00': '6 AM',
    '07:00': '7 AM',
    '08:00': '8 AM',
    '09:00': '9 AM',
    '10:00': '10 AM',
    '11:00': '11 AM',
    '12:00': '12 PM',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Step4Notify() {
    const { name, notifyEnabled, setNotifyEnabled, notifyTime, setNotifyTime } = useOnboardingStore();
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    const displayName = name || 'friend';

    const handleTimeSelect = (time: string) => {
        haptics.selection();
        setNotifyTime(time);
    };

    const handleFinish = () => {
        haptics.success();
        // Mark onboarding complete in auth store
        if (user) {
            setUser({ ...user, onboardingComplete: true, musicGenre: useOnboardingStore.getState().musicGenre });
        }
        // Navigate to main app
        router.replace('/(tabs)');
    };

    const handleSkip = () => {
        haptics.light();
        setNotifyEnabled(false);
        handleFinish();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0E1A', colors.void, '#070B14']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <ProgressDots currentStep={4} />

                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.step}>Step 4 of 4</Text>
                    <Text style={styles.title}>Let VinR check on you daily</Text>
                    <Text style={styles.subtitle}>
                        Gentle reminders to keep your streak alive
                    </Text>
                </Animated.View>

                {/* Toggle Section */}
                <Animated.View
                    entering={FadeInDown.delay(300).duration(500)}
                    style={styles.toggleCard}
                >
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleLabelWrap}>
                            <Text style={styles.toggleEmoji}>🔔</Text>
                            <View>
                                <Text style={styles.toggleLabel}>Daily check-in reminders</Text>
                                <Text style={styles.toggleDesc}>
                                    {notifyEnabled ? 'You\'ll get a gentle nudge' : 'Notifications are off'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={notifyEnabled}
                            onValueChange={(val) => {
                                haptics.selection();
                                setNotifyEnabled(val);
                            }}
                            trackColor={{ false: colors.textGhost, true: colors.gold }}
                            thumbColor={colors.textPrimary}
                            ios_backgroundColor={colors.textGhost}
                        />
                    </View>
                </Animated.View>

                {/* Time Picker */}
                {notifyEnabled && (
                    <Animated.View entering={FadeInUp.duration(400)}>
                        <Text style={styles.timeTitle}>What time works best?</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.timeRow}
                        >
                            {TIMES.map((time) => {
                                const isSelected = notifyTime === time;
                                return (
                                    <Pressable
                                        key={time}
                                        style={[
                                            styles.timeChip,
                                            isSelected && styles.timeChipActive,
                                        ]}
                                        onPress={() => handleTimeSelect(time)}
                                    >
                                        <Text
                                            style={[
                                                styles.timeText,
                                                isSelected && styles.timeTextActive,
                                            ]}
                                        >
                                            {TIME_LABELS[time]}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Preview Notification */}
                {notifyEnabled && (
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(500)}
                        style={styles.previewCard}
                    >
                        <Text style={styles.previewHeader}>Preview</Text>
                        <View style={styles.notifPreview}>
                            <View style={styles.notifTop}>
                                <Text style={styles.notifApp}>VinR</Text>
                                <Text style={styles.notifTime}>{TIME_LABELS[notifyTime] || '8 AM'}</Text>
                            </View>
                            <Text style={styles.notifTitle}>Your streak is waiting 🔥</Text>
                            <Text style={styles.notifBody}>
                                Hey {displayName}, your 21-day streak is waiting. Don't break the chain!
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Finish Button */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.buttonGroup}>
                    <Pressable style={styles.finishButton} onPress={handleFinish}>
                        <Text style={styles.finishText}>Finish setup →</Text>
                    </Pressable>

                    <Pressable style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 72,
        paddingBottom: 48,
    },
    step: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: colors.gold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 36,
    },
    // Toggle
    toggleCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 28,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    toggleEmoji: {
        fontSize: 24,
    },
    toggleLabel: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.textPrimary,
    },
    toggleDesc: {
        fontFamily: 'DMSans_300Light',
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    // Time picker
    timeTitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 12,
        textAlign: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 4,
        marginBottom: 28,
        justifyContent: 'center',
    },
    timeChip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timeChipActive: {
        backgroundColor: 'rgba(212,168,83,0.15)',
        borderColor: colors.gold,
        borderWidth: 2,
    },
    timeText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
    },
    timeTextActive: {
        color: colors.gold,
        fontFamily: 'DMSans_600SemiBold',
    },
    // Preview notification
    previewCard: {
        marginBottom: 36,
    },
    previewHeader: {
        fontFamily: 'DMSans_300Light',
        fontSize: 12,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    notifPreview: {
        backgroundColor: colors.elevated,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    notifTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    notifApp: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 12,
        color: colors.gold,
        letterSpacing: 0.5,
    },
    notifTime: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
    },
    notifTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    notifBody: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
    },
    // Buttons
    buttonGroup: {
        gap: 12,
    },
    finishButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    finishText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.void,
        letterSpacing: 0.3,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
    },
});

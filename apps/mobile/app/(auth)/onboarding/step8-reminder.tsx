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
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Bell, Calendar, Trophy } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

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

                    <Animated.Text
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        Maintain the rhythm
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        A soft nudge to keep you aligned with your standards. Reminders help anchor your daily discipline.
                    </Animated.Text>
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

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(1000).springify().damping(15)}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.gold },
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                        >
                            <Text style={[styles.buttonText, { color: colors.void }]}>
                                {isEnabled ? 'Enable & Continue' : 'Continue'}
                            </Text>
                            <ArrowRight size={20} color={colors.void} strokeWidth={3} />
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
    button: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
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

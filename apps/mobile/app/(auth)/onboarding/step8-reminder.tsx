import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, {
    FadeInDown,
    FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Bell, Calendar, Trophy } from 'lucide-react-native';

export default function Step8Reminder() {
    const router = useRouter();
    const { notificationsEnabled, setNotificationsEnabled, reminderTime, setReminderTime } = useOnboardingStore();
    const [isEnabled, setIsEnabled] = useState(notificationsEnabled);

    const toggleSwitch = (value: boolean) => {
        setIsEnabled(value);
        setNotificationsEnabled(value);
    };

    const handleNext = () => {
        router.push('/(auth)/onboarding/step9-finish');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.textSecondary} />
                    </Pressable>
                    <ProgressDots currentStep={8} totalSteps={9} />

                    <Animated.Text
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        Stay Consistent
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Gentle reminders help you maintain your momentum and reach your milestones faster.
                    </Animated.Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View
                        entering={FadeInDown.duration(800).delay(600).springify()}
                        style={styles.card}
                    >
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Bell size={32} color={Colors.gold} strokeWidth={1.5} />
                            </View>
                        </View>

                        <View style={styles.toggleRow}>
                            <View style={styles.toggleTextContainer}>
                                <Text style={styles.toggleTitle}>Daily Practice Reminders</Text>
                                <Text style={styles.toggleSub}>
                                    We'll send a soft nudge to help you stay on track.
                                </Text>
                            </View>
                            <Switch
                                trackColor={{ false: '#3D4560', true: Colors.gold }}
                                thumbColor={Platform.OS === 'ios' ? undefined : (isEnabled ? '#fff' : '#f4f3f4')}
                                ios_backgroundColor="#3D4560"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                        </View>

                        {isEnabled && (
                            <Animated.View entering={FadeIn.duration(400)} style={styles.detailRow}>
                                <Calendar size={18} color={Colors.gold} style={{ marginRight: 8 }} />
                                <Text style={styles.detailText}>Default time: 9:00 AM</Text>
                            </Animated.View>
                        )}
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.duration(800).delay(800).springify()}
                        style={styles.quoteBox}
                    >
                        <Trophy size={20} color={Colors.gold} style={styles.quoteIcon} />
                        <Text style={styles.quoteText}>
                            "Consistency is what transforms average into excellence."
                        </Text>
                    </Animated.View>
                </ScrollView>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(1000).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                        >
                            <LinearGradient
                                colors={[Colors.gold, '#B8860B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>
                                    {isEnabled ? 'Enable & Continue' : 'Continue'}
                                </Text>
                                <ArrowRight size={20} color={Colors.void} strokeWidth={3} />
                            </LinearGradient>
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
        backgroundColor: Colors.void,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
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
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: 32,
        fontSize: 32,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: 12,
        fontSize: 16,
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
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
        color: Colors.textPrimary,
        fontSize: 18,
    },
    toggleSub: {
        fontFamily: 'DMSans_400Regular',
        color: Colors.textMuted,
        fontSize: 14,
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.07)',
    },
    detailText: {
        color: Colors.gold,
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
    },
    quoteBox: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    quoteIcon: {
        marginBottom: 8,
        opacity: 0.6,
    },
    quoteText: {
        fontFamily: 'CormorantGaramond_300Light_Italic',
        color: Colors.gold,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    footer: {
        marginTop: 10,
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
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
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
        color: Colors.void,
        letterSpacing: 0.5,
    },
});

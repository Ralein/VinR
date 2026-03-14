/**
 * Emergency Screen — Crisis intervention
 *
 * Red pulsing border, crisis hotline numbers,
 * Call 988, Text 741741, "I'm safe" option.
 */

import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';

const CRISIS_NUMBERS = [
    { label: '988 Suicide & Crisis Lifeline', number: '988', emoji: '📞', type: 'call' },
    { label: 'Crisis Text Line', number: '741741', emoji: '💬', type: 'text' },
    { label: 'Emergency', number: '911', emoji: '🚨', type: 'call' },
    { label: 'SAMHSA Helpline', number: '1-800-662-4357', emoji: '🆘', type: 'call' },
];

export default function EmergencyScreen() {
    const borderOpacity = useSharedValue(0.3);

    useEffect(() => {
        haptics.error();
        // Pulsing red border
        borderOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const borderAnimatedStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(232, 93, 93, ${borderOpacity.value})`,
    }));

    const handleCall = (number: string) => {
        haptics.heavy();
        const cleaned = number.replace(/[^0-9]/g, '');
        Linking.openURL(`tel:${cleaned}`).catch(() =>
            Alert.alert('Unable to open dialer', `Please call ${number} directly.`)
        );
    };

    const handleText = () => {
        haptics.heavy();
        Linking.openURL('sms:741741&body=HOME').catch(() =>
            Alert.alert('Unable to open SMS', 'Please text HOME to 741741.')
        );
    };

    const handleSafe = () => {
        haptics.medium();
        router.replace('/(tabs)/results');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(400)}>
                <Text style={styles.headerEmoji}>🫂</Text>
                <Text style={styles.title}>You're not alone</Text>
                <Text style={styles.subtitle}>
                    Help is available right now. Please reach out.
                </Text>
            </Animated.View>

            {/* Pulsing red card */}
            <Animated.View style={[styles.crisisCard, borderAnimatedStyle]}>
                {CRISIS_NUMBERS.map((item, index) => (
                    <Animated.View
                        key={item.number}
                        entering={FadeInDown.delay(200 + index * 100).duration(400)}
                    >
                        <Pressable
                            style={styles.crisisRow}
                            onPress={() =>
                                item.type === 'text' ? handleText() : handleCall(item.number)
                            }
                        >
                            <Text style={styles.crisisEmoji}>{item.emoji}</Text>
                            <View style={styles.crisisInfo}>
                                <Text style={styles.crisisLabel}>{item.label}</Text>
                                <Text style={styles.crisisNumber}>{item.number}</Text>
                            </View>
                            <Text style={styles.crisisAction}>
                                {item.type === 'text' ? 'Text →' : 'Call →'}
                            </Text>
                        </Pressable>
                        {index < CRISIS_NUMBERS.length - 1 && <View style={styles.divider} />}
                    </Animated.View>
                ))}
            </Animated.View>

            {/* Primary CTA */}
            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.ctaGroup}>
                <Pressable style={styles.callButton} onPress={() => handleCall('988')}>
                    <Text style={styles.callButtonText}>Call 988 Now</Text>
                </Pressable>

                <Pressable style={styles.textButton} onPress={handleText}>
                    <Text style={styles.textButtonText}>Text HOME to 741741</Text>
                </Pressable>
            </Animated.View>

            {/* I'm safe */}
            <Animated.View entering={FadeIn.delay(1000).duration(400)}>
                <Pressable style={styles.safeButton} onPress={handleSafe}>
                    <Text style={styles.safeText}>I'm safe — show me support</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        paddingHorizontal: 24,
        paddingTop: 80,
    },
    headerEmoji: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 12,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 30,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 28,
    },
    crisisCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        marginBottom: 28,
    },
    crisisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    crisisEmoji: {
        fontSize: 24,
    },
    crisisInfo: {
        flex: 1,
    },
    crisisLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
    },
    crisisNumber: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: colors.textPrimary,
        marginTop: 2,
    },
    crisisAction: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14,
        color: colors.crimson,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    ctaGroup: {
        gap: 12,
        marginBottom: 24,
    },
    callButton: {
        backgroundColor: colors.crimson,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.crimson,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    callButtonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    textButton: {
        backgroundColor: colors.elevated,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    textButtonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.textPrimary,
    },
    safeButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    safeText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
        textDecorationLine: 'underline',
    },
});

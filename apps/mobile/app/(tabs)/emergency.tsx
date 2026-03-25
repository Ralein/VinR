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
import { fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../services/haptics';

const CRISIS_NUMBERS = [
    { label: '988 Suicide & Crisis Lifeline', number: '988', emoji: '📞', type: 'call' },
    { label: 'Crisis Text Line', number: '741741', emoji: '💬', type: 'text' },
    { label: 'Emergency', number: '911', emoji: '🚨', type: 'call' },
    { label: 'SAMHSA Helpline', number: '1-800-662-4357', emoji: '🆘', type: 'call' },
];

export default function EmergencyScreen() {
    const { colors } = useTheme();
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
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(400)}>
                <Text style={styles.headerEmoji}>🫂</Text>
                <Text style={[styles.title, { color: colors.textPrimary }]}>You're not alone</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Help is available right now. Please reach out.
                </Text>
            </Animated.View>

            {/* Pulsing red card */}
            <Animated.View style={[styles.crisisCard, { backgroundColor: colors.surface }, borderAnimatedStyle]}>
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
                                <Text style={[styles.crisisLabel, { color: colors.textMuted }]}>{item.label}</Text>
                                <Text style={[styles.crisisNumber, { color: colors.textPrimary }]}>{item.number}</Text>
                            </View>
                            <Text style={[styles.crisisAction, { color: colors.crimson }]}>
                                {item.type === 'text' ? 'Text →' : 'Call →'}
                            </Text>
                        </Pressable>
                        {index < CRISIS_NUMBERS.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                    </Animated.View>
                ))}
            </Animated.View>

            {/* Primary CTA */}
            <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.ctaGroup}>
                <Pressable style={[styles.callButton, { backgroundColor: colors.crimson, shadowColor: colors.crimson }]} onPress={() => handleCall('988')}>
                    <Text style={styles.callButtonText}>Call 988 Now</Text>
                </Pressable>

                <Pressable style={[styles.textButton, { backgroundColor: colors.elevated, borderColor: colors.border }]} onPress={handleText}>
                    <Text style={[styles.textButtonText, { color: colors.textPrimary }]}>Text HOME to 741741</Text>
                </Pressable>
            </Animated.View>

            {/* I'm safe */}
            <Animated.View entering={FadeIn.delay(1000).duration(400)}>
                <Pressable style={styles.safeButton} onPress={handleSafe}>
                    <Text style={[styles.safeText, { color: colors.textMuted }]}>I'm safe — show me support</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 28,
    },
    crisisCard: {
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
    },
    crisisNumber: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        marginTop: 2,
    },
    crisisAction: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    ctaGroup: {
        gap: 12,
        marginBottom: 24,
    },
    callButton: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
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
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    textButtonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
    },
    safeButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    safeText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});

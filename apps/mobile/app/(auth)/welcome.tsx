/**
 * Welcome Screen — First thing users see
 *
 * Features (to implement in Sprint 1.2):
 * - Full-screen animated gradient background (Skia)
 * - VinR logo with entrance animation (scale + fade, spring)
 * - "vin" white + "ℛ" gold italic lettermark 64px
 * - Tagline reveal with letter-by-letter stagger
 * - "Begin your comeback →" CTA button (gold, glow pulse)
 * - "Already winning? Sign in" secondary link
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '../../constants/theme';

export default function WelcomeScreen() {
    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <Text style={styles.logoVin}>vin</Text>
                <Text style={styles.logoR}>ℛ</Text>
            </View>

            {/* Tagline */}
            <Text style={styles.tagline}>Win your life back</Text>

            {/* CTA */}
            <Pressable
                style={styles.ctaButton}
                onPress={() => router.push('/(auth)/sign-up')}
            >
                <Text style={styles.ctaText}>Begin your comeback →</Text>
            </Pressable>

            {/* Sign In Link */}
            <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                <Text style={styles.signInLink}>Already winning? Sign in</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    logoVin: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 64,
        color: colors.textPrimary,
    },
    logoR: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 72,
        color: colors.gold,
        marginLeft: -4,
        fontStyle: 'italic',
    },
    tagline: {
        fontFamily: 'DMSans_300Light',
        fontSize: 14,
        color: colors.textMuted,
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginBottom: 64,
    },
    ctaButton: {
        backgroundColor: colors.gold,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    ctaText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        color: colors.void,
    },
    signInLink: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.textMuted,
    },
});

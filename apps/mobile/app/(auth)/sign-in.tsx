/**
 * Sign In Screen — Clerk email/password + OAuth
 *
 * Glassmorphism card on dark gradient background
 * Email/Password sign-in with Clerk
 * Google/Apple OAuth buttons
 */

import { useState } from 'react';
import VinRLogo from '../../components/ui/VinRLogo';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { AuthService } from '../../services/auth';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) return;
        haptics.medium();
        setLoading(true);

        try {
            await AuthService.signIn(email, password);
            haptics.success();
            // Automatically redirected by layout
        } catch (err: any) {
            haptics.error();
            Alert.alert('Sign In Failed', err.response?.data?.error || err.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
        haptics.medium();

        try {
            // OAuth handled by Clerk's built-in flow
            Alert.alert('Coming soon', `${strategy === 'oauth_google' ? 'Google' : 'Apple'} sign-in will be configured next`);
        } catch (err: any) {
            haptics.error();
            Alert.alert('Error', err.message || 'OAuth failed');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0E1A', colors.void, '#070B14']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Back button */}
                <Animated.View entering={FadeIn.duration(300)}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>
                </Animated.View>

                {/* VinR Logo */}
                <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.logoRow}>
                    <VinRLogo size="md" />
                </Animated.View>

                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </Animated.View>

                {/* Glassmorphism Card */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles.card}
                >
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={colors.textGhost}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textGhost}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                    </View>

                    {/* Forgot Password */}
                    <Pressable style={styles.forgotLink}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </Pressable>

                    {/* Sign In Button */}
                    <Pressable
                        style={[styles.signInButton, (!email || !password) && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={loading || !email || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.void} />
                        ) : (
                            <Text style={styles.signInButtonText}>Sign in →</Text>
                        )}
                    </Pressable>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* OAuth Buttons */}
                    <View style={styles.oauthRow}>
                        <Pressable
                            style={styles.oauthButton}
                            onPress={() => handleOAuth('oauth_google')}
                        >
                            <Text style={styles.oauthIcon}>G</Text>
                            <Text style={styles.oauthText}>Google</Text>
                        </Pressable>
                        <Pressable
                            style={styles.oauthButton}
                            onPress={() => handleOAuth('oauth_apple')}
                        >
                            <Text style={styles.oauthIcon}></Text>
                            <Text style={styles.oauthText}>Apple</Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Sign Up Link */}
                <Animated.View entering={FadeIn.delay(600).duration(400)}>
                    <Pressable
                        onPress={() => router.replace('/(auth)/sign-up')}
                        style={styles.switchLink}
                    >
                        <Text style={styles.switchText}>
                            Don't have an account?{' '}
                            <Text style={styles.switchHighlight}>Sign up</Text>
                        </Text>
                    </Pressable>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: 60, justifyContent: 'center' },
    backButton: { marginBottom: spacing.lg },
    backText: { fontFamily: 'DMSans_400Regular', color: colors.textMuted, fontSize: 16 },
    logoRow: {
        alignItems: 'center',
        alignSelf: 'center', marginBottom: spacing.lg,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36,
        color: colors.textPrimary, marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textSecondary, marginBottom: spacing.xl,
    },
    card: {
        backgroundColor: glass.background,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: glass.border,
    },
    inputContainer: { marginBottom: spacing.md },
    inputLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 13,
        color: colors.textMuted, marginBottom: 6, letterSpacing: 0.5,
    },
    input: {
        backgroundColor: colors.void,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.sm },
    forgotText: {
        fontFamily: 'DMSans_400Regular', fontSize: 13,
        color: colors.gold,
    },
    signInButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.lg,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: spacing.sm,
        ...shadows.gold,
    },
    buttonDisabled: { opacity: 0.45 },
    signInButtonText: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 17,
        color: colors.void, letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row', alignItems: 'center', marginVertical: 20,
    },
    dividerLine: {
        flex: 1, height: 1, backgroundColor: colors.border,
    },
    dividerText: {
        fontFamily: 'DMSans_300Light', fontSize: 12,
        color: colors.textGhost, marginHorizontal: 12,
    },
    oauthRow: { flexDirection: 'row', gap: 12 },
    oauthButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.elevated, borderRadius: borderRadius.md, paddingVertical: 14,
        borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
    },
    oauthIcon: {
        fontSize: 18, fontWeight: '700', color: colors.textPrimary,
    },
    oauthText: {
        fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.textPrimary,
    },
    switchLink: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: 12 },
    switchText: {
        fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.textMuted,
    },
    switchHighlight: { color: colors.gold, fontFamily: 'DMSans_600SemiBold' },
});

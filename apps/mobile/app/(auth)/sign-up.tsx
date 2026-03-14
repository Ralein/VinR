/**
 * Sign Up Screen — Clerk email/password registration + OAuth
 *
 * Glassmorphism card with email verification flow
 */

import { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';

export default function SignUpScreen() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!isLoaded || !email || !password) return;
        haptics.medium();
        setLoading(true);

        try {
            await signUp.create({ emailAddress: email, password });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
            haptics.success();
        } catch (err: any) {
            haptics.error();
            Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!isLoaded || !code) return;
        haptics.medium();
        setLoading(true);

        try {
            const result = await signUp.attemptEmailAddressVerification({ code });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                haptics.success();
                // User will be auto-redirected by auth guard to onboarding
            }
        } catch (err: any) {
            haptics.error();
            Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid code');
        } finally {
            setLoading(false);
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

                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.title}>
                        {pendingVerification ? 'Verify your email' : 'Your comeback starts now'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {pendingVerification
                            ? `We sent a verification code to ${email}`
                            : 'Create your VinR account'}
                    </Text>
                </Animated.View>

                {/* Card */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles.card}
                >
                    {!pendingVerification ? (
                        <>
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
                                    placeholder="At least 8 characters"
                                    placeholderTextColor={colors.textGhost}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoComplete="new-password"
                                />
                            </View>

                            {/* Sign Up Button */}
                            <Pressable
                                style={[styles.actionButton, (!email || !password) && styles.buttonDisabled]}
                                onPress={handleSignUp}
                                disabled={loading || !email || !password}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.void} />
                                ) : (
                                    <Text style={styles.actionButtonText}>Create account →</Text>
                                )}
                            </Pressable>

                            {/* Privacy note */}
                            <Text style={styles.privacyNote}>
                                🔒 Your data is encrypted and never shared
                            </Text>
                        </>
                    ) : (
                        <>
                            {/* Verification Code Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Verification Code</Text>
                                <TextInput
                                    style={[styles.input, styles.codeInput]}
                                    placeholder="Enter 6-digit code"
                                    placeholderTextColor={colors.textGhost}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>

                            {/* Verify Button */}
                            <Pressable
                                style={[styles.actionButton, !code && styles.buttonDisabled]}
                                onPress={handleVerify}
                                disabled={loading || !code}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.void} />
                                ) : (
                                    <Text style={styles.actionButtonText}>Verify & continue →</Text>
                                )}
                            </Pressable>
                        </>
                    )}
                </Animated.View>

                {/* Sign In Link */}
                {!pendingVerification && (
                    <Animated.View entering={FadeIn.delay(600).duration(400)}>
                        <Pressable
                            onPress={() => router.replace('/(auth)/sign-in')}
                            style={styles.switchLink}
                        >
                            <Text style={styles.switchText}>
                                Already have an account?{' '}
                                <Text style={styles.switchHighlight}>Sign in</Text>
                            </Text>
                        </Pressable>
                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, justifyContent: 'center' },
    backButton: { marginBottom: 24 },
    backText: { fontFamily: 'DMSans_400Regular', color: colors.textMuted, fontSize: 16 },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34,
        color: colors.textPrimary, marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textMuted, marginBottom: 32,
    },
    card: {
        backgroundColor: 'rgba(15, 19, 32, 0.85)',
        borderRadius: 20, padding: 24,
        borderWidth: 1, borderColor: colors.border,
    },
    inputContainer: { marginBottom: 16 },
    inputLabel: {
        fontFamily: 'DMSans_400Regular', fontSize: 13,
        color: colors.textMuted, marginBottom: 6, letterSpacing: 0.5,
    },
    input: {
        backgroundColor: colors.void, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    },
    codeInput: {
        fontSize: 24, letterSpacing: 8, textAlign: 'center',
        fontFamily: 'DMSans_600SemiBold',
    },
    actionButton: {
        backgroundColor: colors.gold, borderRadius: 12,
        paddingVertical: 16, alignItems: 'center', marginTop: 8,
        shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12,
    },
    buttonDisabled: { opacity: 0.5 },
    actionButtonText: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 17,
        color: colors.void, letterSpacing: 0.3,
    },
    privacyNote: {
        fontFamily: 'DMSans_300Light', fontSize: 12,
        color: colors.textGhost, textAlign: 'center', marginTop: 16,
    },
    switchLink: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
    switchText: {
        fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.textMuted,
    },
    switchHighlight: { color: colors.gold, fontFamily: 'DMSans_600SemiBold' },
});

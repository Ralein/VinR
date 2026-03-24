import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Shield, Moon, Droplets, Laptop, LogOut, Bell, ChevronRight, Trash2 } from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { settings, updateSettings, loginMockUser, logoutMockUser } = useSettingsStore();

    const handleMockLogin = () => {
        loginMockUser('mock-user-123', 'Demo User');
        Alert.alert('Logged In', 'You are now using the mock user profile.');
    };

    const handleMockLogout = () => {
        logoutMockUser();
        Alert.alert('Logged Out', 'You have been logged out of the mock profile.');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account & Auth (Mock)</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Shield size={20} color={colors.emerald} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>Mock Auth Enabled</Text>
                            <Text style={styles.rowSubtitle}>Use local Zustand state for auth</Text>
                        </View>
                        <Switch
                            value={settings.isMockAuthEnabled}
                            onValueChange={(val) => updateSettings({ isMockAuthEnabled: val })}
                            trackColor={{ false: colors.elevated, true: colors.emerald + '80' }}
                            thumbColor={settings.isMockAuthEnabled ? colors.emerald : colors.textMuted}
                        />
                    </View>
                    <View style={styles.divider} />
                    
                    {settings.mockUserId ? (
                        <View>
                            <View style={styles.row}>
                                <View style={styles.rowIcon}>
                                    <User size={20} color={colors.gold} />
                                </View>
                                <View style={styles.rowTextContainer}>
                                    <Text style={styles.rowTitle}>Signed In As</Text>
                                    <Text style={styles.rowSubtitle}>{settings.mockUserName}</Text>
                                </View>
                            </View>
                            <Pressable style={styles.logoutButton} onPress={handleMockLogout}>
                                <LogOut size={18} color={colors.gold} />
                                <Text style={styles.logoutText}>Sign Out</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable style={styles.loginButton} onPress={handleMockLogin}>
                            <User size={18} color={colors.void} />
                            <Text style={styles.loginText}>Sign In (Demo)</Text>
                        </Pressable>
                    )}
                </View>

                {/* My Profile Link */}
                <Pressable
                    style={[styles.card, { marginTop: spacing.md }]}
                    onPress={() => router.push('/profile-settings' as any)}
                >
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <User size={20} color={colors.gold} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>My Profile</Text>
                            <Text style={styles.rowSubtitle}>View your info and manage account</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textGhost} />
                    </View>
                </Pressable>

                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>App Preferences</Text>
                <View style={styles.card}>
                    <Pressable style={styles.row} onPress={() => router.push('/notification-settings' as any)}>
                        <View style={styles.rowIcon}>
                            <Bell size={20} color={colors.sapphire} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>Notifications</Text>
                            <Text style={styles.rowSubtitle}>Reminders and alerts</Text>
                        </View>
                    </Pressable>
                    <View style={styles.divider} />
                    
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Moon size={20} color={colors.textPrimary} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>Dark Mode</Text>
                            <Text style={styles.rowSubtitle}>Force dark theme</Text>
                        </View>
                        <Switch
                            value={settings.theme === 'dark'}
                            onValueChange={(val) => updateSettings({ theme: val ? 'dark' : 'system' })}
                            trackColor={{ false: colors.elevated, true: colors.gold + '80' }}
                            thumbColor={settings.theme === 'dark' ? colors.gold : colors.textMuted}
                        />
                    </View>
                    <View style={styles.divider} />
                    
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Droplets size={20} color={colors.gold} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>Haptic Feedback</Text>
                            <Text style={styles.rowSubtitle}>Vibrate on actions</Text>
                        </View>
                        <Switch
                            value={settings.hapticFeedbackEnabled}
                            onValueChange={(val) => updateSettings({ hapticFeedbackEnabled: val })}
                            trackColor={{ false: colors.elevated, true: colors.gold + '80' }}
                            thumbColor={settings.hapticFeedbackEnabled ? colors.gold : colors.textMuted}
                        />
                    </View>
                </View>

                {/* Developer Section */}
                <Text style={styles.sectionTitle}>Developer</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Laptop size={20} color={colors.textMuted} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>Developer Mode</Text>
                            <Text style={styles.rowSubtitle}>Show experimental features</Text>
                        </View>
                        <Switch
                            value={settings.developerMode}
                            onValueChange={(val) => updateSettings({ developerMode: val })}
                            trackColor={{ false: colors.elevated, true: colors.gold + '80' }}
                            thumbColor={settings.developerMode ? colors.gold : colors.textMuted}
                        />
                    </View>
                </View>

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: colors.crimson }]}>Danger Zone</Text>
                <Pressable
                    style={[styles.card, { borderColor: `${colors.crimson}30` }]}
                    onPress={() => router.push('/profile-settings' as any)}
                >
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: `${colors.crimson}15` }]}>
                            <Trash2 size={20} color={colors.crimson} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.crimson }]}>Delete Account</Text>
                            <Text style={styles.rowSubtitle}>Permanently remove your data</Text>
                        </View>
                        <ChevronRight size={18} color={colors.crimson} />
                    </View>
                </Pressable>
                
                <Text style={styles.versionText}>VinR v1.0.0 (Alpha)</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 20,
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        marginTop: spacing.xl,
        paddingHorizontal: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    rowSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 60,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gold,
        margin: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    loginText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.void,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.elevated,
        borderWidth: 1,
        borderColor: colors.gold + '50',
        margin: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    logoutText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.gold,
    },
    versionText: {
        fontFamily: fonts.mono,
        fontSize: 12,
        color: colors.textGhost,
        textAlign: 'center',
        marginTop: spacing['2xl'],
        marginBottom: spacing.lg,
    }
});

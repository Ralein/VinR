import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, User, Shield, Moon, Sun, Smartphone,
    Droplets, Laptop, LogOut, Bell, ChevronRight, Trash2
} from 'lucide-react-native';
import { fonts, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useSettingsStore } from '../store/useSettingsStore';
import type { UserSettings } from '../store/useSettingsStore';

type ThemePref = 'light' | 'system' | 'dark';

// ── 3-way Theme Segment Control ─────────────────────────────────────

const THEME_OPTIONS: { value: ThemePref; Icon: typeof Sun; label: string }[] = [
    { value: 'light', Icon: Sun, label: 'Light' },
    { value: 'system', Icon: Smartphone, label: 'System' },
    { value: 'dark', Icon: Moon, label: 'Dark' },
];

function ThemePicker({ value, onChange }: { value: ThemePref; onChange: (v: ThemePref) => void }) {
    const { colors } = useTheme();

    return (
        <View style={[pickerStyles.wrapper, {
            backgroundColor: colors.elevated,
            borderColor: colors.border,
        }]}>
            {THEME_OPTIONS.map(({ value: opt, Icon, label }) => {
                const active = value === opt;
                return (
                    <Pressable
                        key={opt}
                        onPress={() => onChange(opt)}
                        style={[
                            pickerStyles.segment,
                            active && {
                                backgroundColor: colors.gold,
                                shadowColor: colors.gold,
                                shadowOpacity: 0.35,
                                shadowRadius: 8,
                                elevation: 4,
                            }
                        ]}
                    >
                        <Icon
                            size={16}
                            color={active ? colors.void : colors.textMuted}
                            strokeWidth={active ? 2.5 : 1.8}
                        />
                        <Text style={[
                            pickerStyles.label,
                            {
                                color: active ? colors.void : colors.textMuted,
                                fontFamily: active ? fonts.bodySemiBold : fonts.body,
                            }
                        ]}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const pickerStyles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        padding: 4,
        gap: 4,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: borderRadius.md,
        gap: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    label: {
        fontSize: 13,
    },
});

// ── Main Screen ────────────────────────────────────────────────────

export default function SettingsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.void }}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account &amp; Auth (Mock)</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                            <Shield size={20} color={colors.emerald} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Mock Auth Enabled</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Use local Zustand state for auth</Text>
                        </View>
                        <Switch
                            value={settings.isMockAuthEnabled}
                            onValueChange={(val) => updateSettings({ isMockAuthEnabled: val })}
                            trackColor={{ false: colors.elevated, true: colors.emerald + '80' }}
                            thumbColor={settings.isMockAuthEnabled ? colors.emerald : colors.textMuted}
                        />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {settings.mockUserId ? (
                        <View>
                            <View style={styles.row}>
                                <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                                    <User size={20} color={colors.gold} />
                                </View>
                                <View style={styles.rowTextContainer}>
                                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Signed In As</Text>
                                    <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{settings.mockUserName}</Text>
                                </View>
                            </View>
                            <Pressable
                                style={[styles.actionButton, {
                                    backgroundColor: colors.elevated,
                                    borderColor: colors.gold + '50',
                                }]}
                                onPress={handleMockLogout}
                            >
                                <LogOut size={18} color={colors.gold} />
                                <Text style={[styles.actionButtonText, { color: colors.gold }]}>Sign Out</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            style={[styles.actionButton, { backgroundColor: colors.gold, margin: spacing.md }]}
                            onPress={handleMockLogin}
                        >
                            <User size={18} color={colors.void} />
                            <Text style={[styles.actionButtonText, { color: colors.void }]}>Sign In (Demo)</Text>
                        </Pressable>
                    )}
                </View>

                {/* My Profile Link */}
                <Pressable
                    style={[styles.card, { marginTop: spacing.md, backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push('/profile-settings' as any)}
                >
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                            <User size={20} color={colors.gold} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>My Profile</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>View your info and manage account</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textGhost} />
                    </View>
                </Pressable>

                {/* Preferences Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>App Preferences</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Notifications */}
                    <Pressable style={styles.row} onPress={() => router.push('/notification-settings' as any)}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                            <Bell size={20} color={colors.sapphire} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Notifications</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Reminders and alerts</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textGhost} />
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Theme */}
                    <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: spacing.sm }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.rowIcon, { backgroundColor: colors.elevated, marginRight: spacing.md }]}>
                                <Moon size={20} color={colors.textPrimary} />
                            </View>
                            <View style={styles.rowTextContainer}>
                                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Appearance</Text>
                                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Light, dark, or follow system</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: 52 }}>
                            <ThemePicker
                                value={settings.theme as ThemePref}
                                onChange={(v) => updateSettings({ theme: v })}
                            />
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Haptic */}
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                            <Droplets size={20} color={colors.gold} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Vibrate on actions</Text>
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
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Developer</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
                            <Laptop size={20} color={colors.textMuted} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Developer Mode</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Show experimental features</Text>
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
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: `${colors.crimson}30` }]}
                    onPress={() => router.push('/profile-settings' as any)}
                >
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: `${colors.crimson}15` }]}>
                            <Trash2 size={20} color={colors.crimson} />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={[styles.rowTitle, { color: colors.crimson }]}>Delete Account</Text>
                            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Permanently remove your data</Text>
                        </View>
                        <ChevronRight size={18} color={colors.crimson} />
                    </View>
                </Pressable>

                <Text style={[styles.versionText, { color: colors.textGhost }]}>VinR v1.0.0 (Alpha)</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 20,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        marginTop: spacing.xl,
        paddingHorizontal: spacing.sm,
    },
    card: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
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
        marginBottom: 2,
    },
    rowSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
    },
    divider: {
        height: 1,
        marginLeft: 60,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    actionButtonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
    },
    versionText: {
        fontFamily: fonts.mono,
        fontSize: 12,
        textAlign: 'center',
        marginTop: spacing['2xl'],
        marginBottom: spacing.lg,
    },
});

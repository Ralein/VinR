import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Layout } from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fonts, borderRadius } from '../../constants/theme';

const STATS = [
    { label: 'Total Minutes', value: '428', icon: '⏱️' },
    { label: 'Current Streak', value: '5 Days', icon: '🔥' },
    { label: 'Sessions', value: '24', icon: '🧘' },
];

export default function ProfileScreen() {
    const { colors, fonts, spacing, borderRadius, isDark, toggleTheme } = useTheme();
    const themeName = isDark ? 'dark' : 'light';

    return (
        <Layout title="Your Profile">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.gold }]} />
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>Ralein</Text>
                    <Text style={[styles.userBio, { color: colors.textMuted }]}>Mindfulness Practitioner</Text>
                </View>

                <View style={styles.statsGrid}>
                    {STATS.map(stat => (
                        <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={[styles.statValue, { color: colors.gold }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.section, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Preferences</Text>
                    <Pressable style={styles.menuItem}>
                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Meditation Reminders</Text>
                        <Text style={[styles.menuValue, { color: colors.gold }]}>8:00 AM</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem}>
                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Voice Guide</Text>
                        <Text style={[styles.menuValue, { color: colors.gold }]}>Oliver (Calm)</Text>
                    </Pressable>
                    <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleTheme}>
                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Appearance</Text>
                        <Text style={[styles.menuValue, { color: colors.gold }]}>
                            {themeName === 'dark' ? 'Midnight (Dark)' : 'Purity (Light)'}
                        </Text>
                    </Pressable>
                </View>

                <Pressable style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </Pressable>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        marginBottom: spacing.md,
    },
    userName: {
        fontFamily: fonts.display,
        fontSize: 24,
        marginBottom: 4,
    },
    userBio: {
        fontFamily: fonts.body,
        fontSize: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontFamily: fonts.display,
        fontSize: 18,
    },
    statLabel: {
        fontFamily: fonts.body,
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    section: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
    },
    sectionTitle: {
        fontFamily: fonts.display,
        fontSize: 18,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuText: {
        fontFamily: fonts.body,
        fontSize: 16,
    },
    menuValue: {
        fontFamily: fonts.body,
        fontSize: 14,
    },
    logoutButton: {
        padding: spacing.md,
        alignItems: 'center',
    },
    logoutText: {
        fontFamily: fonts.body,
        fontSize: 16,
        color: '#F87171',
    },
});

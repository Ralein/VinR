import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Layout } from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fonts, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const JOURNAL_ENTRIES = [
    { id: '1', date: 'Oct 24', mood: '☀️', title: 'Morning Clarity', content: 'Feeling refreshed after the guided session on presence.' },
    { id: '2', date: 'Oct 23', mood: '🌿', title: 'Midday Reset', content: 'Took 10 minutes to breathe and center myself during work.' },
    { id: '3', date: 'Oct 22', mood: '🌙', title: 'Deep Sleep', content: 'The ambient nature sounds really helped me drift off tonight.' },
];

const JournalScreen = () => {
    const { colors, isDark } = useTheme();
    const themeName = isDark ? 'dark' : 'light';

    return (
        <Layout title="Your Journal">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.entryGrid}>
                    {JOURNAL_ENTRIES.map(entry => (
                        <Pressable key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.dateBadge, { backgroundColor: colors.void, borderColor: colors.border }]}>
                                <Text style={[styles.dateText, { color: colors.textMuted }]}>{entry.date}</Text>
                            </View>
                            <View style={styles.entryHeader}>
                                <Text style={styles.moodEmoji}>{entry.mood}</Text>
                                <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>{entry.title}</Text>
                            </View>
                            <Text style={[styles.entryContent, { color: colors.textSecondary }]} numberOfLines={2}>
                                {entry.content}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={[styles.addButton, { borderColor: colors.gold + '40' }]}>
                    <Text style={[styles.addButtonText, { color: colors.gold }]}>+ New Entry</Text>
                </Pressable>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    entryGrid: {
        gap: spacing.md,
    },
    entryCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    dateBadge: {
        position: 'absolute',
        top: -spacing.sm,
        right: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
    },
    dateText: {
        fontFamily: fonts.body,
        fontSize: 12,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    moodEmoji: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    entryTitle: {
        fontFamily: fonts.display,
        fontSize: 18,
    },
    entryContent: {
        fontFamily: fonts.body,
        fontSize: 14,
        lineHeight: 20,
    },
    addButton: {
        marginTop: spacing.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    addButtonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
    },
});

export default JournalScreen;

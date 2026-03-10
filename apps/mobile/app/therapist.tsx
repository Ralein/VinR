/**
 * Therapist Directory — Destigmatizing professional support
 *
 * Navigable from Home or Profile, not a tab.
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import { useTherapistDirectory, TherapistProvider, WhyTherapy } from '../hooks/useAdaptive';

const SPECIALTIES = ['all', 'anxiety', 'depression', 'stress', 'trauma', 'relationships'];

function ProviderCard({ provider }: { provider: TherapistProvider }) {
    return (
        <Pressable
            style={({ pressed }) => [
                providerStyles.card,
                pressed && { transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => Linking.openURL(provider.url)}
        >
            <View style={providerStyles.header}>
                <Text style={providerStyles.emoji}>{provider.emoji}</Text>
                <View style={providerStyles.info}>
                    <Text style={providerStyles.name}>{provider.name}</Text>
                    <View style={providerStyles.badges}>
                        {provider.telehealth && (
                            <View style={providerStyles.badge}>
                                <Text style={providerStyles.badgeText}>📹 Telehealth</Text>
                            </View>
                        )}
                        {provider.accepts_insurance && (
                            <View style={[providerStyles.badge, { borderColor: colors.emerald + '40' }]}>
                                <Text style={[providerStyles.badgeText, { color: colors.emerald }]}>
                                    ✓ Insurance
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <Text style={providerStyles.description}>{provider.description}</Text>
            <Text style={providerStyles.link}>Visit {provider.name} →</Text>
        </Pressable>
    );
}

function WhyTherapyCard({ item }: { item: WhyTherapy }) {
    return (
        <View style={whyStyles.card}>
            <Text style={whyStyles.title}>{item.title}</Text>
            <Text style={whyStyles.text}>{item.text}</Text>
        </View>
    );
}

export default function TherapistScreen() {
    const router = useRouter();
    const [specialty, setSpecialty] = useState<string | undefined>(undefined);
    const { data, isLoading } = useTherapistDirectory(specialty);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>

                <Text style={styles.title}>Find Support</Text>
                <Text style={styles.subtitle}>
                    Professional help is a sign of strength, not weakness.
                </Text>

                {/* Specialty Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {SPECIALTIES.map((s) => (
                        <Pressable
                            key={s}
                            style={[
                                styles.filterChip,
                                specialty === (s === 'all' ? undefined : s) && styles.filterChipActive,
                                !specialty && s === 'all' && styles.filterChipActive,
                            ]}
                            onPress={() => setSpecialty(s === 'all' ? undefined : s)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    (specialty === (s === 'all' ? undefined : s) ||
                                        (!specialty && s === 'all')) &&
                                    styles.filterTextActive,
                                ]}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Providers */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recommended Platforms</Text>
                            {data?.providers.map((provider) => (
                                <ProviderCard key={provider.id} provider={provider} />
                            ))}
                        </View>

                        {/* Why Therapy */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Why therapy?</Text>
                            {data?.why_therapy.map((item, i) => (
                                <WhyTherapyCard key={i} item={item} />
                            ))}
                        </View>

                        {/* Crisis Banner */}
                        <Pressable
                            style={styles.crisisBanner}
                            onPress={() => Linking.openURL('tel:988')}
                        >
                            <Text style={styles.crisisEmoji}>🆘</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.crisisTitle}>In immediate danger?</Text>
                                <Text style={styles.crisisText}>
                                    Call 988 (Suicide & Crisis Lifeline) — available 24/7
                                </Text>
                            </View>
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ──────────────────────────── Styles ────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    scroll: { paddingBottom: 100 },
    backButton: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    backText: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold,
    },
    title: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg, marginTop: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textMuted, lineHeight: 22,
        paddingHorizontal: spacing.lg, marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    filterRow: {
        paddingHorizontal: spacing.lg, gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    filterChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface, borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.goldGlow, borderColor: colors.gold,
    },
    filterText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.textMuted,
    },
    filterTextActive: { color: colors.gold },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 20,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    crisisBanner: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.lg, marginBottom: spacing.xl,
        backgroundColor: colors.crimson + '15',
        borderRadius: borderRadius.lg, padding: spacing.md,
        borderWidth: 1, borderColor: colors.crimson + '30',
        gap: spacing.sm,
    },
    crisisEmoji: { fontSize: 28 },
    crisisTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.crimson,
    },
    crisisText: {
        fontFamily: fonts.body, fontSize: 13, color: colors.textMuted,
        marginTop: 2,
    },
});

const providerStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    emoji: { fontSize: 32 },
    info: { flex: 1 },
    name: {
        fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.textPrimary,
    },
    badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
    badge: {
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: borderRadius.full, borderWidth: 1,
        borderColor: colors.sapphire + '40',
    },
    badgeText: {
        fontFamily: fonts.body, fontSize: 11, color: colors.sapphire,
    },
    description: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
        lineHeight: 20, marginBottom: spacing.sm,
    },
    link: {
        fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.gold,
    },
});

const whyStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.sapphire + '20',
    },
    title: {
        fontFamily: fonts.bodySemiBold, fontSize: 15,
        color: colors.sapphire, marginBottom: 4,
    },
    text: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, lineHeight: 20,
    },
});

/**
 * Profile → "My Journey" Analytics Dashboard
 *
 * - Mood trend line chart (gold line, emerald streak dots)
 * - Emotion distribution donut chart
 * - AI insight cards
 * - Total stats row
 */

import { useState } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import {
    useAnalyticsSummary,
    useAnalyticsTrends,
    MoodTrendPoint,
    EmotionSlice,
    InsightCard,
} from '../../hooks/useAnalytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;

// Emotion color mapping for donut
const EMOTION_COLORS: Record<string, string> = {
    happy: '#F0C96B',
    grateful: '#D4A853',
    calm: '#4ECBA0',
    hopeful: '#4A90D9',
    okay: '#7A8099',
    neutral: '#7A8099',
    anxious: '#E8A85D',
    stressed: '#E8875D',
    lonely: '#9B59B6',
    sad: '#5D8CE8',
    angry: '#E85D5D',
    overwhelmed: '#E85D75',
};

// ──────────────────────────── Mini Line Chart ────────────────────────────

function MoodLineChart({ trends }: { trends: MoodTrendPoint[] }) {
    if (trends.length < 2) {
        return (
            <View style={chartStyles.empty}>
                <Text style={chartStyles.emptyText}>
                    Check in a few more times to see your mood trend ✨
                </Text>
            </View>
        );
    }

    const maxScore = 5;
    const minScore = 1;
    const range = maxScore - minScore;
    const padding = 8;
    const usableWidth = CHART_WIDTH - padding * 2;
    const usableHeight = CHART_HEIGHT - padding * 2 - 20;

    const points = trends.map((t, i) => ({
        x: padding + (i / (trends.length - 1)) * usableWidth,
        y: padding + 10 + usableHeight - ((t.mood_score - minScore) / range) * usableHeight,
        isStreak: t.is_streak_day,
        score: t.mood_score,
    }));

    // Build SVG-like path using View positioning
    return (
        <View style={[chartStyles.container, { height: CHART_HEIGHT }]}>
            {/* Y-axis labels */}
            {[5, 4, 3, 2, 1].map((val) => {
                const y = padding + 10 + usableHeight - ((val - minScore) / range) * usableHeight;
                return (
                    <View key={val} style={[chartStyles.gridLine, { top: y }]}>
                        <Text style={chartStyles.yLabel}>{val}</Text>
                        <View style={chartStyles.gridDash} />
                    </View>
                );
            })}

            {/* Line segments */}
            {points.slice(0, -1).map((p, i) => {
                const next = points[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                    <View
                        key={`line-${i}`}
                        style={[
                            chartStyles.lineSegment,
                            {
                                left: p.x,
                                top: p.y,
                                width: length,
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                            },
                        ]}
                    />
                );
            })}

            {/* Data points */}
            {points.map((p, i) => (
                <View
                    key={`dot-${i}`}
                    style={[
                        chartStyles.dot,
                        {
                            left: p.x - 4,
                            top: p.y - 4,
                            backgroundColor: p.isStreak ? colors.emerald : colors.gold,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ──────────────────────────── Donut Chart ────────────────────────────

function EmotionDonut({ distribution }: { distribution: EmotionSlice[] }) {
    if (distribution.length === 0) {
        return (
            <View style={donutStyles.empty}>
                <Text style={chartStyles.emptyText}>No emotion data yet</Text>
            </View>
        );
    }

    // Simple bar representation (true donut requires SVG)
    return (
        <View style={donutStyles.container}>
            <View style={donutStyles.bars}>
                {distribution.map((slice) => (
                    <View key={slice.emotion} style={donutStyles.barRow}>
                        <View style={donutStyles.labelRow}>
                            <View
                                style={[
                                    donutStyles.colorDot,
                                    { backgroundColor: EMOTION_COLORS[slice.emotion] || colors.textMuted },
                                ]}
                            />
                            <Text style={donutStyles.label}>{slice.emotion}</Text>
                            <Text style={donutStyles.pct}>{slice.percentage}%</Text>
                        </View>
                        <View style={donutStyles.barBg}>
                            <View
                                style={[
                                    donutStyles.barFill,
                                    {
                                        width: `${slice.percentage}%`,
                                        backgroundColor: EMOTION_COLORS[slice.emotion] || colors.gold,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ──────────────────────────── Stat Card ────────────────────────────

function StatCard({ value, label, emoji }: { value: number; label: string; emoji: string }) {
    return (
        <View style={statStyles.card}>
            <Text style={statStyles.emoji}>{emoji}</Text>
            <Text style={statStyles.value}>{value}</Text>
            <Text style={statStyles.label}>{label}</Text>
        </View>
    );
}

// ──────────────────────────── Insight Card ────────────────────────────

function InsightCardView({ insight }: { insight: InsightCard }) {
    return (
        <View style={insightStyles.card}>
            <Text style={insightStyles.emoji}>{insight.emoji}</Text>
            <Text style={insightStyles.text}>{insight.text}</Text>
        </View>
    );
}

// ──────────────────────────── Main Screen ────────────────────────────

export default function ProfileScreen() {
    const [period, setPeriod] = useState('30d');
    const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
    const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends(period);

    const isLoading = loadingSummary || loadingTrends;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <Text style={styles.title}>My Journey</Text>
                    <Text style={styles.subtitle}>Your wellness analytics</Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Loading your journey...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Row */}
                        {summary && (
                            <View style={styles.statsRow}>
                                <StatCard value={summary.total_checkins} label="Check-ins" emoji="💬" />
                                <StatCard value={summary.total_days_completed} label="Days" emoji="📅" />
                                <StatCard value={summary.best_streak} label="Best Streak" emoji="🔥" />
                                <StatCard value={summary.journal_entries} label="Journals" emoji="📓" />
                            </View>
                        )}

                        {/* Period Selector */}
                        <View style={styles.periodRow}>
                            {['7d', '14d', '30d'].map((p) => (
                                <Pressable
                                    key={p}
                                    style={[
                                        styles.periodChip,
                                        period === p && styles.periodChipActive,
                                    ]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            period === p && styles.periodTextActive,
                                        ]}
                                    >
                                        {p.replace('d', ' days')}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Mood Trend Chart */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Mood Trend</Text>
                            <View style={styles.chartCard}>
                                <MoodLineChart trends={trends?.mood_trends || []} />
                                <View style={styles.legendRow}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
                                        <Text style={styles.legendText}>Mood</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.emerald }]} />
                                        <Text style={styles.legendText}>Streak day</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Emotion Distribution */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Emotion Breakdown</Text>
                            <View style={styles.chartCard}>
                                <EmotionDonut distribution={trends?.emotion_distribution || []} />
                            </View>
                        </View>

                        {/* Streak Correlation */}
                        {trends?.streak_correlation && trends.streak_correlation.improvement_percent > 0 && (
                            <View style={styles.correlationCard}>
                                <Text style={styles.correlationEmoji}>📊</Text>
                                <Text style={styles.correlationText}>
                                    You feel{' '}
                                    <Text style={styles.correlationHighlight}>
                                        {trends.streak_correlation.improvement_percent}% better
                                    </Text>{' '}
                                    on days you complete your habit.
                                </Text>
                            </View>
                        )}

                        {/* AI Insights */}
                        {trends?.insights && trends.insights.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Insights</Text>
                                {trends.insights.map((insight, i) => (
                                    <InsightCardView key={i} insight={insight} />
                                ))}
                            </View>
                        )}
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
    header: {
        alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg,
    },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.gold,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    },
    avatarEmoji: { fontSize: 32 },
    title: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary, marginBottom: 4,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
    },
    loadingContainer: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, marginTop: spacing.md,
    },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    periodRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: spacing.sm, marginBottom: spacing.lg,
    },
    periodChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
    },
    periodChipActive: {
        backgroundColor: colors.goldGlow,
        borderColor: colors.gold,
    },
    periodText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
        color: colors.textMuted,
    },
    periodTextActive: { color: colors.gold },
    section: {
        paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: fonts.display, fontSize: 20,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    chartCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md, borderWidth: 1,
        borderColor: colors.border,
    },
    legendRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: spacing.lg, marginTop: spacing.sm,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
        fontFamily: fonts.body, fontSize: 12, color: colors.textMuted,
    },
    correlationCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md, borderWidth: 1,
        borderColor: colors.emerald + '30',
        gap: spacing.sm,
    },
    correlationEmoji: { fontSize: 28 },
    correlationText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textPrimary, flex: 1,
    },
    correlationHighlight: {
        fontFamily: fonts.bodySemiBold, color: colors.emerald,
    },
});

const chartStyles = StyleSheet.create({
    container: {
        width: CHART_WIDTH, position: 'relative',
    },
    empty: {
        height: CHART_HEIGHT, justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted, textAlign: 'center',
    },
    gridLine: {
        position: 'absolute', left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
    },
    yLabel: {
        fontFamily: fonts.mono, fontSize: 10,
        color: colors.textGhost, width: 16, textAlign: 'right',
        marginRight: 4,
    },
    gridDash: {
        flex: 1, height: 1,
        backgroundColor: colors.border,
    },
    lineSegment: {
        position: 'absolute', height: 2,
        backgroundColor: colors.gold,
        borderRadius: 1,
    },
    dot: {
        position: 'absolute', width: 8, height: 8,
        borderRadius: 4, borderWidth: 2,
        borderColor: colors.surface,
    },
});

const donutStyles = StyleSheet.create({
    container: { paddingVertical: spacing.sm },
    empty: {
        height: 100, justifyContent: 'center', alignItems: 'center',
    },
    bars: { gap: spacing.sm },
    barRow: { gap: 4 },
    labelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    colorDot: { width: 10, height: 10, borderRadius: 5 },
    label: {
        fontFamily: fonts.bodySemiBold, fontSize: 13,
        color: colors.textPrimary, flex: 1, textTransform: 'capitalize',
    },
    pct: {
        fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted,
    },
    barBg: {
        height: 6, backgroundColor: colors.elevated,
        borderRadius: 3, overflow: 'hidden',
    },
    barFill: { height: 6, borderRadius: 3 },
});

const statStyles = StyleSheet.create({
    card: {
        flex: 1, alignItems: 'center', backgroundColor: colors.surface,
        borderRadius: borderRadius.md, paddingVertical: spacing.md,
        marginHorizontal: 4, borderWidth: 1, borderColor: colors.border,
    },
    emoji: { fontSize: 20, marginBottom: 4 },
    value: {
        fontFamily: fonts.mono, fontSize: 22,
        color: colors.textPrimary,
    },
    label: {
        fontFamily: fonts.body, fontSize: 11,
        color: colors.textMuted, marginTop: 2,
    },
});

const insightStyles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.goldGlow,
        gap: spacing.sm,
    },
    emoji: { fontSize: 24, marginTop: 2 },
    text: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textPrimary, flex: 1,
        lineHeight: 20,
    },
});

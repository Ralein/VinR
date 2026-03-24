import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Layout from '../../components/layout/Layout';
import { colors, spacing, fonts, borderRadius } from '../../theme';

const JOURNEY_STEPS = [
    { id: 1, title: 'Foundations of Focus', emoji: '🌱', status: 'completed', duration: '5 days' },
    { id: 2, title: 'The Art of Presence', emoji: '🌿', status: 'active', duration: '7 days' },
    { id: 3, title: 'Deep Work Deep Rest', emoji: '🌲', status: 'locked', duration: '7 days' },
    { id: 4, title: 'Vin Evolution', emoji: '✨', status: 'locked', duration: '14 days' },
];

export default function JourneyScreen() {
    return (
        <Layout title="Your Journey">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerCard}>
                    <Text style={styles.progressLabel}>Total Journey Progress</Text>
                    <Text style={styles.progressValue}>32%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '32%' }]} />
                    </View>
                </View>

                {JOURNEY_STEPS.map((step, index) => (
                    <View key={step.id} style={styles.stepRow}>
                        {/* Connector line */}
                        {index < JOURNEY_STEPS.length - 1 && (
                            <View style={[
                                styles.connector,
                                step.status === 'completed' ? styles.connectorActive : null
                            ]} />
                        )}

                        <View style={[
                            styles.stepIconContainer,
                            step.status === 'completed' ? styles.iconCompleted :
                            step.status === 'active' ? styles.iconActive : styles.iconLocked
                        ]}>
                            <Text style={styles.stepEmoji}>{step.emoji}</Text>
                        </View>

                        <View style={[
                            styles.stepDetails,
                            step.status === 'locked' && { opacity: 0.5 }
                        ]}>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepMeta}>{step.duration} • {step.status.charAt(0).toUpperCase() + step.status.slice(1)}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    headerCard: {
        backgroundColor: colors.elevated,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressLabel: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    progressValue: {
        fontFamily: fonts.heading,
        fontSize: 32,
        color: colors.gold,
        marginBottom: spacing.md,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.gold,
        borderRadius: borderRadius.full,
        ...colors.shadowGold,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingLeft: spacing.sm,
    },
    stepIconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        zIndex: 1,
    },
    iconCompleted: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
    },
    iconActive: {
        backgroundColor: colors.elevated,
        borderColor: colors.gold,
        ...colors.shadowGold,
    },
    iconLocked: {
        backgroundColor: colors.elevated,
        borderColor: colors.border,
    },
    stepEmoji: {
        fontSize: 28,
    },
    stepDetails: {
        marginLeft: spacing.lg,
        flex: 1,
    },
    stepTitle: {
        fontFamily: fonts.heading,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    stepMeta: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
    },
    connector: {
        position: 'absolute',
        top: 64,
        left: 40,
        width: 2,
        height: spacing.xl + 20,
        backgroundColor: colors.border,
        zIndex: 0,
    },
    connectorActive: {
        backgroundColor: colors.gold,
    },
});

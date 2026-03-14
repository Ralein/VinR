/**
 * Guided Yoga Screen — 12 illustrated yoga cards + sequence builder
 *
 * Simple asanas for anxiety/depression with hold timers
 */

import { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, Pressable, StyleSheet,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../constants/theme';

interface YogaPose {
    id: string;
    name: string;
    emoji: string;
    holdSeconds: number;
    benefit: string;
    source: string;
    category: 'anxiety' | 'depression' | 'stress' | 'general';
}

const YOGA_POSES: YogaPose[] = [
    { id: 'child', name: 'Child\'s Pose', emoji: '🧒', holdSeconds: 30, benefit: 'Calms the nervous system and reduces anxiety', source: 'Mayo Clinic', category: 'anxiety' },
    { id: 'cat_cow', name: 'Cat-Cow', emoji: '🐱', holdSeconds: 30, benefit: 'Releases spinal tension and promotes mindful breathing', source: 'Johns Hopkins', category: 'stress' },
    { id: 'forward_fold', name: 'Standing Forward Fold', emoji: '🙇', holdSeconds: 30, benefit: 'Reduces tension headaches and calms the mind', source: 'APA', category: 'anxiety' },
    { id: 'legs_up', name: 'Legs Up the Wall', emoji: '🦵', holdSeconds: 60, benefit: 'Activates parasympathetic response, reduces insomnia', source: 'Mayo Clinic', category: 'anxiety' },
    { id: 'bridge', name: 'Bridge Pose', emoji: '🌉', holdSeconds: 30, benefit: 'Opens the chest and counteracts depressive posture', source: 'Johns Hopkins', category: 'depression' },
    { id: 'cobra', name: 'Cobra Pose', emoji: '🐍', holdSeconds: 20, benefit: 'Elevates mood by opening the heart center', source: 'APA', category: 'depression' },
    { id: 'warrior2', name: 'Warrior II', emoji: '⚔️', holdSeconds: 30, benefit: 'Builds confidence and mental focus', source: 'Mayo Clinic', category: 'depression' },
    { id: 'tree', name: 'Tree Pose', emoji: '🌳', holdSeconds: 30, benefit: 'Improves balance and present-moment awareness', source: 'Johns Hopkins', category: 'general' },
    { id: 'seated_twist', name: 'Seated Twist', emoji: '🔄', holdSeconds: 30, benefit: 'Releases stored tension in the spine', source: 'Mayo Clinic', category: 'stress' },
    { id: 'corpse', name: 'Savasana', emoji: '🧘', holdSeconds: 120, benefit: 'Induces deep relaxation and stress relief', source: 'APA', category: 'general' },
    { id: 'downward_dog', name: 'Downward Dog', emoji: '🐕', holdSeconds: 30, benefit: 'Full body stretch that energizes and calms', source: 'Johns Hopkins', category: 'general' },
    { id: 'pigeon', name: 'Pigeon Pose', emoji: '🕊️', holdSeconds: 45, benefit: 'Releases stored emotional tension in the hips', source: 'Mayo Clinic', category: 'stress' },
];

function PoseCard({
    pose,
    selected,
    onToggle,
}: {
    pose: YogaPose;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <Pressable
            style={[
                poseStyles.card,
                selected && poseStyles.cardSelected,
            ]}
            onPress={onToggle}
        >
            <View style={poseStyles.header}>
                <Text style={poseStyles.emoji}>{pose.emoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={poseStyles.name}>{pose.name}</Text>
                    <Text style={poseStyles.hold}>{pose.holdSeconds}s hold</Text>
                </View>
                {selected && <Text style={poseStyles.check}>✓</Text>}
            </View>
            <Text style={poseStyles.benefit}>{pose.benefit}</Text>
            <Text style={poseStyles.source}>Source: {pose.source}</Text>
        </Pressable>
    );
}

export default function YogaScreen() {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeSession, setActiveSession] = useState(false);
    const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const togglePose = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else if (next.size < 5) {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const selectedPoses = YOGA_POSES.filter((p) => selectedIds.has(p.id));

    const startSession = () => {
        if (selectedPoses.length < 3) return;
        setActiveSession(true);
        setCurrentPoseIdx(0);
        setCountdown(selectedPoses[0].holdSeconds);
    };

    useEffect(() => {
        if (!activeSession) return;

        const interv = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Move to next pose
                    setCurrentPoseIdx((idx) => {
                        const nextIdx = idx + 1;
                        if (nextIdx >= selectedPoses.length) {
                            setActiveSession(false);
                            clearInterval(interv);
                            return idx;
                        }
                        setCountdown(selectedPoses[nextIdx].holdSeconds);
                        return nextIdx;
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timerRef.current = interv;
        return () => clearInterval(interv);
    }, [activeSession, selectedPoses]);

    if (activeSession && selectedPoses.length > 0) {
        const pose = selectedPoses[currentPoseIdx];
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.sessionContainer}>
                    <Text style={styles.sessionCounter}>
                        {currentPoseIdx + 1} / {selectedPoses.length}
                    </Text>
                    <Text style={styles.sessionEmoji}>{pose.emoji}</Text>
                    <Text style={styles.sessionName}>{pose.name}</Text>
                    <Text style={styles.sessionCountdown}>{countdown}s</Text>
                    <Text style={styles.sessionBenefit}>{pose.benefit}</Text>
                    <Pressable
                        style={styles.sessionStop}
                        onPress={() => {
                            setActiveSession(false);
                            if (timerRef.current) clearInterval(timerRef.current);
                        }}
                    >
                        <Text style={styles.sessionStopText}>End Session</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </Pressable>

                <Text style={styles.title}>Guided Yoga</Text>
                <Text style={styles.subtitle}>
                    Select 3–5 poses to build your sequence
                </Text>

                {/* Selection Count */}
                <View style={styles.selectionBar}>
                    <Text style={styles.selectionText}>
                        {selectedIds.size} / 5 poses selected
                    </Text>
                    {selectedIds.size >= 3 && (
                        <Pressable style={styles.startButton} onPress={startSession}>
                            <Text style={styles.startText}>Start Sequence →</Text>
                        </Pressable>
                    )}
                </View>

                {/* Pose Cards */}
                {YOGA_POSES.map((pose) => (
                    <PoseCard
                        key={pose.id}
                        pose={pose}
                        selected={selectedIds.has(pose.id)}
                        onToggle={() => togglePose(pose.id)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    scroll: { paddingBottom: 100 },
    backButton: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    backText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.gold },
    title: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg, marginTop: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body, fontSize: 15,
        color: colors.textMuted,
        paddingHorizontal: spacing.lg, marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    selectionBar: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    selectionText: {
        fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted,
    },
    startButton: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: borderRadius.full, backgroundColor: colors.gold,
    },
    startText: {
        fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.void,
    },
    sessionContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    sessionCounter: {
        fontFamily: fonts.mono, fontSize: 14, color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    sessionEmoji: { fontSize: 80, marginBottom: spacing.md },
    sessionName: {
        fontFamily: fonts.display, fontSize: 28,
        color: colors.textPrimary, marginBottom: spacing.sm,
    },
    sessionCountdown: {
        fontFamily: fonts.mono, fontSize: 64,
        color: colors.gold, marginBottom: spacing.md,
    },
    sessionBenefit: {
        fontFamily: fonts.italic, fontSize: 16,
        color: colors.textMuted, textAlign: 'center',
        marginBottom: spacing.xl,
    },
    sessionStop: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, backgroundColor: colors.crimson + '20',
        borderWidth: 1, borderColor: colors.crimson + '40',
    },
    sessionStopText: {
        fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.crimson,
    },
});

const poseStyles = StyleSheet.create({
    card: {
        marginHorizontal: spacing.lg, marginBottom: spacing.sm,
        backgroundColor: colors.surface, borderRadius: borderRadius.md,
        padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    cardSelected: {
        borderColor: colors.gold, backgroundColor: colors.goldGlow,
    },
    header: {
        flexDirection: 'row', alignItems: 'center',
        gap: spacing.sm, marginBottom: 6,
    },
    emoji: { fontSize: 28 },
    name: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.textPrimary },
    hold: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
    check: { fontSize: 20, color: colors.gold },
    benefit: {
        fontFamily: fonts.body, fontSize: 13,
        color: colors.textMuted, marginBottom: 4,
    },
    source: {
        fontFamily: fonts.body, fontSize: 11, color: colors.textGhost,
    },
});

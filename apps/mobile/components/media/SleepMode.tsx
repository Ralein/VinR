/**
 * SleepMode — Dim overlay with breathing animation and auto-stop timer
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';
import { useMediaStore } from '../../stores/mediaStore';

const TIMER_OPTIONS = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
];

interface SleepModeProps {
    visible: boolean;
    onClose: () => void;
}

export default function SleepMode({ visible, onClose }: SleepModeProps) {
    const { setSleepTimer, sleepTimerMinutes } = useMediaStore();
    const [selectedTimer, setSelectedTimer] = useState<number>(30);

    const handleStart = () => {
        setSleepTimer(selectedTimer);
        // In a full implementation, this would also:
        // - Dim the screen brightness
        // - Start a breathing animation cycle
        // - Auto-queue sleep music if not already playing
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="overFullScreen"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Moon */}
                    <Text style={styles.moonEmoji}>🌙</Text>
                    <Text style={styles.title}>Sleep Mode</Text>
                    <Text style={styles.subtitle}>
                        Dim the lights. Breathe slowly.{'\n'}VinR will stop playing after your timer.
                    </Text>

                    {/* Timer selection */}
                    <View style={styles.timerRow}>
                        {TIMER_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[
                                    styles.timerChip,
                                    selectedTimer === opt.value && styles.timerChipActive,
                                ]}
                                onPress={() => setSelectedTimer(opt.value)}
                            >
                                <Text
                                    style={[
                                        styles.timerChipText,
                                        selectedTimer === opt.value && styles.timerChipTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Status */}
                    {sleepTimerMinutes && (
                        <View style={styles.statusBanner}>
                            <Text style={styles.statusText}>
                                😴 Sleep timer active: {sleepTimerMinutes} min
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    <Pressable style={styles.startButton} onPress={handleStart}>
                        <Text style={styles.startText}>
                            {sleepTimerMinutes ? 'Update Timer' : 'Start Sleep Timer'}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(7,9,15,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gold + '20',
    },
    moonEmoji: { fontSize: 48, marginBottom: spacing.md },
    title: {
        fontFamily: fonts.display,
        fontSize: 24,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    timerRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    timerChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timerChipActive: {
        backgroundColor: colors.gold + '20',
        borderColor: colors.gold,
    },
    timerChipText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
    },
    timerChipTextActive: {
        color: colors.gold,
        fontFamily: fonts.bodySemiBold,
    },
    statusBanner: {
        backgroundColor: colors.gold + '10',
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginBottom: spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    statusText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.gold,
    },
    startButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    startText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.void,
    },
    closeButton: {
        paddingVertical: spacing.sm,
    },
    closeText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
    },
});

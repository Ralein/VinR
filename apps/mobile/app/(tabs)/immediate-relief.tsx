import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Wind, Activity } from 'lucide-react-native';
import { fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import BreathingAnimation, { BreathingPattern } from '../../components/BreathingAnimation';

export default function ImmediateReliefScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [activePattern, setActivePattern] = useState<BreathingPattern>('box');
    const [isBreathing, setIsBreathing] = useState(false);

    const toggleBreathing = () => {
        setIsBreathing(!isBreathing);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.void }]}>
            <View style={[styles.root, { backgroundColor: colors.void }]}>
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <ChevronLeft size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Immediate Relief</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Take a Moment</Text>
                    <Text style={[styles.subtitle, { color: colors.textGhost }]}>
                        Follow the animation to calm your nervous system and find your center.
                    </Text>

                    <View style={styles.selectorContainer}>
                        <TouchableOpacity
                            style={[styles.selectorButton, activePattern === 'box' && styles.selectorButtonActive]}
                            onPress={() => { setActivePattern('box'); setIsBreathing(false); }}
                            activeOpacity={0.8}
                        >
                            <Wind size={20} color={activePattern === 'box' ? colors.gold : colors.textGhost} />
                            <Text style={[styles.selectorText, { color: colors.textGhost }, activePattern === 'box' && { color: colors.gold }]}>Box Breathing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.selectorButton, activePattern === '478' && styles.selectorButtonActive]}
                            onPress={() => { setActivePattern('478'); setIsBreathing(false); }}
                            activeOpacity={0.8}
                        >
                            <Activity size={20} color={activePattern === '478' ? colors.gold : colors.textGhost} />
                            <Text style={[styles.selectorText, { color: colors.textGhost }, activePattern === '478' && { color: colors.gold }]}>4-7-8 Pattern</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.animationWrapper}>
                        <BreathingAnimation pattern={activePattern} isActive={isBreathing} />
                    </View>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={toggleBreathing}
                        activeOpacity={0.8}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.actionButtonBlur}>
                            <Text style={[styles.actionButtonText, { color: colors.gold }]}>
                                {isBreathing ? "Pause Exercise" : "Start Exercise"}
                            </Text>
                        </BlurView>
                    </TouchableOpacity>

                    <View style={styles.infoCard}>
                        {activePattern === 'box' ? (
                            <>
                                <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Box Breathing (4-4-4-4)</Text>
                                <Text style={[styles.infoDescription, { color: colors.textGhost }]}>
                                    Box breathing, also known as four-square breathing, involves exhaling to a count of four, holding your lungs empty for a four-count, inhaling at the same pace, and holding air in your lungs for a count of four before exhaling and beginning the pattern anew.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>4-7-8 Breathing</Text>
                                <Text style={[styles.infoDescription, { color: colors.textGhost }]}>
                                    The 4-7-8 breathing technique, also known as "relaxing breath," involves breathing in for 4 seconds, holding the breath for 7 seconds, and exhaling for 8 seconds. This breathing pattern aims to reduce anxiety or help people get to sleep.
                                </Text>
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 17,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'] * 2,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 28,
        marginBottom: spacing.xs,
        marginTop: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 15,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    selectorContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 4,
        marginBottom: spacing.xl,
    },
    selectorButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        borderRadius: 12,
    },
    selectorButtonActive: {
        backgroundColor: 'rgba(212, 168, 83, 0.15)',
    },
    selectorText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 14,
    },
    animationWrapper: {
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    actionButtonBlur: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 168, 83, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 168, 83, 0.2)',
    },
    actionButtonText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    infoTitle: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.sm,
    },
    infoDescription: {
        fontFamily: fonts.body,
        fontSize: 14,
        lineHeight: 24,
    },
});

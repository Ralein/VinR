/**
 * Results Screen — AI analysis results with two-pathway cards
 *
 * VinR reflection card, therapist nudge, immediate relief techniques,
 * daily habits, and "Start my 21-day journey" CTA.
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    Wind, Layers, Activity, Moon, Heart, Star,
    Zap, ChevronRight, Leaf, Sparkles,
} from 'lucide-react-native';
import { colors, fonts, spacing, glass, typography, borderRadius, animation, shadows, gradients } from '../../constants/theme';
import { haptics } from '../../services/haptics';
import { useCheckinStore } from '../../stores/checkinStore';
import { InstructionSheet } from '../../components/checkin/InstructionSheet';

interface ReliefItem {
    id: string;
    name: string;
    emoji: string;
    category: string;
    duration: string;
    instructions: string[];
    scienceNote: string;
    source: string;
}

// Map category strings → Lucide icon components
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
    breathing:    Wind,
    grounding:    Layers,
    movement:     Activity,
    sleep:        Moon,
    mindfulness:  Sparkles,
    gratitude:    Heart,
    habit:        Leaf,
    meditation:   Star,
};
function getCategoryIcon(category: string): React.ElementType {
    return CATEGORY_ICON_MAP[category.toLowerCase()] ?? Zap;
}

function TechniqueCard({ item, onPress, index }: {
    item: ReliefItem; onPress: () => void; index: number;
}) {
    const Icon = getCategoryIcon(item.category);
    return (
        <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(400)}>
            <Pressable style={styles.techniqueCard} onPress={onPress}>
                <View style={styles.techniqueIconWrap}>
                    <Icon size={20} color={colors.gold} strokeWidth={1.8} />
                </View>
                <View style={styles.techniqueInfo}>
                    <Text style={styles.techniqueName}>{item.name}</Text>
                    <Text style={styles.techniqueDuration}>{item.duration} • {item.category}</Text>
                </View>
                <ChevronRight size={18} color={colors.textGhost} strokeWidth={1.5} />
            </Pressable>
        </Animated.View>
    );
}

export default function ResultsScreen() {
    const plan = useCheckinStore((s) => s.plan);
    const reset = useCheckinStore((s) => s.reset);
    const [selectedItem, setSelectedItem] = useState<ReliefItem | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);

    const handleItemPress = (item: ReliefItem) => {
        haptics.light();
        setSelectedItem(item);
        setSheetVisible(true);
    };

    const handleStartJourney = () => {
        haptics.success();
        reset();
        router.replace('/(tabs)/journey');
    };

    const handleDone = () => {
        haptics.light();
        reset();
        router.replace('/(tabs)');
    };

    if (!plan) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No results yet</Text>
                    <Pressable onPress={() => router.replace('/(tabs)/checkin')}>
                        <Text style={styles.emptyLink}>Start a check-in →</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Reflection Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.reflectionCard}>
                    <Text style={styles.reflectionQuote}>"{plan.emotionSummary}"</Text>
                    <Text style={styles.reflectionSupport}>{plan.supportMessage}</Text>
                </Animated.View>

                {/* Affirmation */}
                <Animated.View entering={FadeIn.delay(400).duration(500)} style={styles.affirmationWrap}>
                    <Text style={styles.affirmationLabel}>Today's affirmation</Text>
                    <Text style={styles.affirmation}>"{plan.affirmation}"</Text>
                </Animated.View>

                {/* Therapist Nudge */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.therapistBanner}>
                    <Heart size={18} color={colors.sapphire} strokeWidth={1.8} />
                    <Text style={styles.therapistText}>{plan.therapistNote}</Text>
                </Animated.View>

                {/* Immediate Relief Pathway */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                    <View style={styles.pathwayHeader}>
                        <View style={[styles.pathwayDot, { backgroundColor: colors.gold }]} />
                        <Zap size={15} color={colors.gold} strokeWidth={2} style={{ marginRight: 4 }} />
                        <Text style={styles.pathwayTitle}>Immediate Relief</Text>
                    </View>
                    <View style={[styles.pathwayCard, styles.goldBorder]}>
                        {plan.immediateRelief.map((item, index) => (
                            <TechniqueCard
                                key={item.id}
                                item={item}
                                index={index}
                                onPress={() => handleItemPress(item)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Daily Habits Pathway */}
                <Animated.View entering={FadeInDown.delay(800).duration(400)}>
                    <View style={styles.pathwayHeader}>
                        <View style={[styles.pathwayDot, { backgroundColor: colors.emerald }]} />
                        <Leaf size={15} color={colors.emerald} strokeWidth={2} style={{ marginRight: 4 }} />
                        <Text style={styles.pathwayTitle}>21-Day Daily Habits</Text>
                    </View>
                    <View style={[styles.pathwayCard, styles.emeraldBorder]}>
                        {plan.dailyHabits.map((item, index) => (
                            <TechniqueCard
                                key={item.id}
                                item={item}
                                index={index + 3}
                                onPress={() => handleItemPress(item)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Gratitude Prompt */}
                <Animated.View entering={FadeIn.delay(1000).duration(400)} style={styles.gratitudeWrap}>
                    <Text style={styles.gratitudeLabel}>Tonight's reflection</Text>
                    <Text style={styles.gratitudeText}>{plan.gratitudePrompt}</Text>
                </Animated.View>

                {/* Start Journey CTA */}
                <Animated.View entering={FadeInDown.delay(1100).duration(400)} style={styles.ctaGroup}>
                    <Pressable style={styles.journeyButton} onPress={handleStartJourney}>
                        <Text style={styles.journeyButtonText}>Start my 21-day journey →</Text>
                    </Pressable>

                    <Pressable style={styles.doneButton} onPress={handleDone}>
                        <Text style={styles.doneText}>Save for later</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>

            {/* Instruction Bottom Sheet */}
            <InstructionSheet
                item={selectedItem}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.void },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
    },
    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'DMSans_400Regular', fontSize: 16,
        color: colors.textMuted, marginBottom: 12,
    },
    emptyLink: {
        fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: colors.gold,
    },
    // Reflection
    reflectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
    },
    reflectionQuote: {
        fontFamily: 'DMSans_300Light',
        fontSize: 18,
        color: colors.textPrimary,
        fontStyle: 'italic',
        lineHeight: 28,
        marginBottom: 12,
    },
    reflectionSupport: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.gold,
        lineHeight: 22,
    },
    // Affirmation
    affirmationWrap: {
        marginBottom: 20,
        alignItems: 'center',
    },
    affirmationLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    affirmation: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: colors.gold,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Therapist
    therapistBanner: {
        backgroundColor: 'rgba(74,144,217,0.1)',
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(74,144,217,0.2)',
        marginBottom: 28,
    },
    therapistText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: colors.sapphire,
        flex: 1,
        lineHeight: 20,
    },
    // Pathways
    pathwayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    pathwayDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    pathwayTitle: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.textPrimary,
        flex: 1,
    },
    pathwayCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
        borderTopWidth: 3,
    },
    goldBorder: {
        borderTopColor: colors.gold,
    },
    emeraldBorder: {
        borderTopColor: colors.emerald,
    },
    techniqueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    techniqueIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${colors.gold}14`,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: `${colors.gold}22`,
    },
    techniqueInfo: {
        flex: 1,
    },
    techniqueName: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
        color: colors.textPrimary,
    },
    techniqueDuration: {
        fontFamily: 'DMSans_300Light',
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
        textTransform: 'capitalize',
    },
    techniqueArrow: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textGhost,
    },
    // Gratitude
    gratitudeWrap: {
        alignItems: 'center',
        marginBottom: 28,
    },
    gratitudeLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textGhost,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    gratitudeText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    // CTAs
    ctaGroup: {
        gap: 12,
    },
    journeyButton: {
        backgroundColor: colors.gold,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    journeyButtonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.void,
        letterSpacing: 0.3,
    },
    doneButton: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    doneText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: colors.textMuted,
    },
});

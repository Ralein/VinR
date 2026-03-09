/**
 * Onboarding Step 3 — "What music moves your soul?"
 *
 * 10 genre chips in a scrollable grid.
 * Single-select with gold glow on chosen genre.
 * Each chip has emoji icon + genre name.
 */

import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { colors, animation } from '../../../constants/theme';
import { haptics } from '../../../services/haptics';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ProgressDots } from '../../../components/ui/ProgressDots';

const GENRES = [
    { id: 'pop', emoji: '🎤', label: 'Pop' },
    { id: 'rnb', emoji: '🎵', label: 'R&B' },
    { id: 'hiphop', emoji: '🎧', label: 'Hip-Hop' },
    { id: 'classical', emoji: '🎻', label: 'Classical' },
    { id: 'indie', emoji: '🎸', label: 'Indie' },
    { id: 'electronic', emoji: '🎹', label: 'Electronic' },
    { id: 'country', emoji: '🤠', label: 'Country' },
    { id: 'kpop', emoji: '💜', label: 'K-Pop' },
    { id: 'jazz', emoji: '🎷', label: 'Jazz' },
    { id: 'rock', emoji: '🤘', label: 'Rock' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GenreChip({ id, emoji, label, isSelected, onPress, index }: {
    id: string; emoji: string; label: string; isSelected: boolean; onPress: () => void; index: number;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.06 : 1, animation.spring) }],
        borderColor: isSelected ? colors.gold : colors.border,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? 'rgba(212,168,83,0.12)' : colors.surface,
        shadowColor: isSelected ? colors.gold : 'transparent',
        shadowOpacity: withSpring(isSelected ? 0.3 : 0, animation.spring),
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.genreChip, animatedStyle]}
        >
            <Animated.View entering={FadeInDown.delay(200 + index * 70).duration(400)}>
                <Text style={styles.genreEmoji}>{emoji}</Text>
                <Text style={[styles.genreLabel, isSelected && styles.genreLabelActive]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
}

export default function Step3Music() {
    const { musicGenre, setMusicGenre } = useOnboardingStore();
    const canContinue = musicGenre !== null;

    const handleSelect = (id: string) => {
        haptics.selection();
        setMusicGenre(id);
    };

    const handleContinue = () => {
        if (!canContinue) return;
        haptics.medium();
        router.push('/(auth)/onboarding/step4-notify');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0E1A', colors.void, '#070B14']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <ProgressDots currentStep={3} />

                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.step}>Step 3 of 4</Text>
                    <Text style={styles.title}>What music moves your soul?</Text>
                    <Text style={styles.subtitle}>
                        We'll curate your personal vibe section
                    </Text>
                </Animated.View>

                {/* Genre Grid */}
                <View style={styles.genreGrid}>
                    {GENRES.map((genre, index) => (
                        <GenreChip
                            key={genre.id}
                            {...genre}
                            index={index}
                            isSelected={musicGenre === genre.id}
                            onPress={() => handleSelect(genre.id)}
                        />
                    ))}
                </View>

                {/* Continue Button */}
                <Animated.View entering={FadeInDown.delay(1000).duration(400)}>
                    <Pressable
                        style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!canContinue}
                    >
                        <Text style={styles.continueText}>Continue →</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: 72,
        paddingBottom: 48,
    },
    step: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: colors.gold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
        textAlign: 'center',
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 36,
    },
    genreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    genreChip: {
        width: '29%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 8,
        borderRadius: 16,
        gap: 6,
    },
    genreEmoji: {
        fontSize: 28,
        textAlign: 'center',
    },
    genreLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
    },
    genreLabelActive: {
        color: colors.gold,
        fontFamily: 'DMSans_600SemiBold',
    },
    continueButton: {
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
    buttonDisabled: {
        opacity: 0.4,
    },
    continueText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 17,
        color: colors.void,
        letterSpacing: 0.3,
    },
});

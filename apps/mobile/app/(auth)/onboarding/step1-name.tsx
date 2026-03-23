/**
 * Onboarding Step 1 — "What should we call you?"
 *
 * Name input + 8 emoji avatars in 2×4 grid.
 * Gold border + scale on selected avatar.
 * Spring entrance animations, haptic feedback.
 */

import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
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

const AVATARS = [
    { id: 'lion', emoji: '🦁', label: 'Lion' },
    { id: 'bear', emoji: '🐻', label: 'Bear' },
    { id: 'fox', emoji: '🦊', label: 'Fox' },
    { id: 'panda', emoji: '🐼', label: 'Panda' },
    { id: 'frog', emoji: '🐸', label: 'Frog' },
    { id: 'butterfly', emoji: '🦋', label: 'Butterfly' },
    { id: 'octopus', emoji: '🐙', label: 'Octopus' },
    { id: 'owl', emoji: '🦉', label: 'Owl' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AvatarChip({ id, emoji, label, isSelected, onPress, index }: {
    id: string; emoji: string; label: string; isSelected: boolean; onPress: () => void; index: number;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.08 : 1, animation.spring) }],
        borderColor: isSelected ? colors.gold : colors.border,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? 'rgba(212,168,83,0.12)' : colors.surface,
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.avatarChip, animatedStyle]}
        >
            <Animated.View entering={FadeInDown.delay(200 + index * 80).duration(400)}>
                <Text style={styles.avatarEmoji}>{emoji}</Text>
                <Text style={[styles.avatarLabel, isSelected && styles.avatarLabelActive]}>
                    {label}
                </Text>
            </Animated.View>
        </AnimatedPressable>
    );
}

export default function Step1Name() {
    const { name, setName, age, setAge, avatarId, setAvatarId } = useOnboardingStore();
    const canContinue = name.trim().length >= 2 && age.trim().length > 0 && avatarId !== null;

    const handleAvatarSelect = (id: string) => {
        haptics.selection();
        setAvatarId(id);
    };

    const handleContinue = () => {
        if (!canContinue) return;
        haptics.medium();
        router.push('/(auth)/onboarding/step2-mood');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0E1A', colors.void, '#070B14']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <ProgressDots currentStep={1} />

                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.step}>Step 1 of 4</Text>
                    <Text style={styles.title}>What should we call you?</Text>
                    <Text style={styles.subtitle}>Pick a name and your spirit animal</Text>
                </Animated.View>

                {/* Name Input */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles.inputWrapper}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Your name"
                        placeholderTextColor={colors.textGhost}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        maxLength={24}
                        autoFocus
                    />
                </Animated.View>

                {/* Age Input */}
                <Animated.View
                    entering={FadeInDown.delay(300).duration(500)}
                    style={styles.inputWrapper}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Your age"
                        placeholderTextColor={colors.textGhost}
                        value={age}
                        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        maxLength={3}
                    />
                </Animated.View>

                {/* Avatar Grid */}
                <View style={styles.avatarGrid}>
                    {AVATARS.map((avatar, index) => (
                        <AvatarChip
                            key={avatar.id}
                            {...avatar}
                            index={index}
                            isSelected={avatarId === avatar.id}
                            onPress={() => handleAvatarSelect(avatar.id)}
                        />
                    ))}
                </View>

                {/* Continue Button */}
                <Animated.View entering={FadeInDown.delay(900).duration(400)}>
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
        fontSize: 30,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 32,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontFamily: 'DMSans_400Regular',
        fontSize: 18,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        textAlign: 'center',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    avatarChip: {
        width: 72,
        height: 88,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    avatarEmoji: {
        fontSize: 32,
        textAlign: 'center',
    },
    avatarLabel: {
        fontFamily: 'DMSans_300Light',
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'center',
    },
    avatarLabelActive: {
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

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import {
    ArrowLeft,
    Check,
    User,
    Sun,
    Leaf,
    Gem,
    Flame,
    Waves,
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import { haptics } from '../../../services/haptics';
import { OnboardingBackground } from '../../../components/ui/OnboardingBackground';
import { LiquidCTA } from '../../../components/ui/LiquidCTA';

const { height } = Dimensions.get('window');

const AVATARS = [
    { id: '1', icon: User, label: 'The Explorer' },
    { id: '2', icon: Sun, label: 'The Luminary' },
    { id: '3', icon: Leaf, label: 'The Naturalist' },
    { id: '4', icon: Gem, label: 'The Diamond' },
    { id: '5', icon: Flame, label: 'The Catalyst' },
    { id: '6', icon: Waves, label: 'The Serene' },
];

export default function Step4Avatar() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { avatarId, setAvatarId } = useOnboardingStore();

    // Animations
    const headerOp = useSharedValue(0);
    const titleOp = useSharedValue(0);
    const subtitleOp = useSharedValue(0);

    useEffect(() => {
        headerOp.value = withDelay(100, withTiming(1, { duration: 400 }));
        titleOp.value = withDelay(250, withTiming(1, { duration: 500 }));
        subtitleOp.value = withDelay(400, withTiming(1, { duration: 500 }));
    }, []);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOp.value,
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOp.value,
    }));

    const handleNext = () => {
        if (avatarId) {
            router.push('/onboarding/step5-focus');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <OnboardingBackground />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + (height > 800 ? 30 : 15),
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                {/* ─── Header ─── */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={4} totalSteps={9} />
                </Animated.View>

                {/* ─── Title ─── */}
                <Animated.View style={[styles.titleSection, titleStyle]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Define your identity
                    </Text>
                </Animated.View>

                {/* ─── Subtitle ─── */}
                <Animated.View style={[styles.subtitleSection, subtitleStyle]}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Your presence is an echo of your purpose. Shape it with intention.
                    </Text>
                </Animated.View>

                {/* ─── Grid ─── */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {AVATARS.map((avatar, index) => {
                        const isSelected = avatarId === avatar.id;
                        const AvatarIcon = avatar.icon;
                        return (
                            <Animated.View
                                key={avatar.id}
                                entering={FadeIn.duration(800)
                                    .delay(550 + index * 40)}
                                style={styles.avatarWrapper}
                            >
                                <Pressable
                                    onPress={() => {
                                        haptics.light();
                                        setAvatarId(avatar.id);
                                    }}
                                    style={({ pressed }) => [
                                        styles.avatarPressable,
                                        pressed && styles.avatarPressed,
                                    ]}
                                >
                                    <GlassCard
                                        accent={isSelected ? 'gold' : undefined}
                                        glow={isSelected}
                                    >
                                        <View style={styles.avatarCard}>
                                            {isSelected && (
                                                <Animated.View
                                                    entering={FadeIn.duration(300)}
                                                    style={[
                                                        styles.checkIcon,
                                                        { backgroundColor: colors.gold },
                                                    ]}
                                                >
                                                    <Check
                                                        size={12}
                                                        color={colors.void}
                                                        strokeWidth={4}
                                                    />
                                                </Animated.View>
                                            )}
                                            <AvatarIcon
                                                size={40}
                                                color={
                                                    isSelected
                                                        ? colors.gold
                                                        : colors.textGhost
                                                }
                                                strokeWidth={1.5}
                                            />
                                            <Text
                                                style={[
                                                    styles.label,
                                                    {
                                                        color: isSelected
                                                            ? colors.gold
                                                            : colors.textSecondary,
                                                    },
                                                    isSelected && styles.labelSelected,
                                                ]}
                                            >
                                                {avatar.label}
                                            </Text>
                                        </View>
                                    </GlassCard>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* ─── Footer ─── */}
                <View style={[styles.footer, { paddingTop: 20 }]}>
                    <LiquidCTA
                        label="CONTINUE"
                        delay={1350}
                        onPress={handleNext}
                        isDisabled={!avatarId}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleSection: {
        marginBottom: 12,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
    },
    subtitleSection: {
        marginBottom: 24,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    avatarWrapper: {
        width: '47%',
        marginBottom: 18,
    },
    avatarPressable: {
        width: '100%',
    },
    avatarPressed: {
        transform: [{ scale: 0.96 }],
    },
    avatarCard: {
        padding: 24,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    labelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    footer: {
        width: '100%',
    },
});
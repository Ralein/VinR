import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    ScrollView,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, { 
    FadeInDown,
    FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width } = Dimensions.get('window');

const AVATARS = [
    { id: '1', emoji: '🧘‍♂️', label: 'Zen Master' },
    { id: '2', emoji: '🌟', label: 'Radiant Soul' },
    { id: '3', emoji: '🌿', label: 'Nature Lover' },
    { id: '4', emoji: '💎', label: 'Clear Diamond' },
    { id: '5', emoji: '🔥', label: 'Phoenix' },
    { id: '6', emoji: '🌊', label: 'Calm Wave' },
];

export default function Step4Avatar() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { avatarId, setAvatarId } = useOnboardingStore();

    const handleNext = () => {
        if (avatarId) {
            router.push('/onboarding/step5-focus');
        }
    };

    return (
        <View style={styles.container}>
            <AmbientBackground />
            <View style={[styles.content, { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                    <ProgressDots currentStep={4} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        Choose your avatar
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Select an icon that resonates with you. This will represent you in the VinR community.
                    </Animated.Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {AVATARS.map((avatar, index) => {
                        const isSelected = avatarId === avatar.id;
                        return (
                            <Animated.View 
                                key={avatar.id}
                                entering={FadeInRight.duration(600).delay(500 + index * 100).springify()}
                                style={styles.avatarWrapper}
                            >
                                <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.avatarCard,
                                            pressed && styles.avatarCardPressed
                                        ]}
                                        onPress={() => setAvatarId(avatar.id)}
                                    >
                                        {isSelected && (
                                            <View style={styles.checkIcon}>
                                                <Check size={12} color={theme.colors.void} strokeWidth={4} />
                                            </View>
                                        )}
                                        <Text style={styles.emoji}>{avatar.emoji}</Text>
                                        <Text style={[
                                            styles.label,
                                            isSelected && styles.labelSelected
                                        ]}>
                                            {avatar.label}
                                        </Text>
                                    </Pressable>
                                </GlassCard>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(1000).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !avatarId && styles.buttonDisabled,
                                pressed && avatarId && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!avatarId}
                        >
                            <LinearGradient
                                colors={avatarId ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !avatarId && { color: '#666' }
                                ]}>
                                    Continue
                                </Text>
                                <ArrowRight size={20} color={avatarId ? theme.colors.void : '#666'} strokeWidth={3} />
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.void,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.textPrimary,
        marginTop: 32,
        fontSize: 32,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 12,
        fontSize: 16,
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    avatarWrapper: {
        width: '47%',
        marginBottom: 20,
    },
    avatarCard: {
        padding: 24,
        alignItems: 'center',
        height: 160,
        justifyContent: 'center',
        position: 'relative',
    },
    avatarCardPressed: {
        transform: [{ scale: 0.97 }],
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    labelSelected: {
        color: theme.colors.gold,
        fontFamily: 'DMSans_700Bold',
    },
    footer: {
        marginTop: 20,
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
        color: theme.colors.void,
        letterSpacing: 0.5,
    },
});

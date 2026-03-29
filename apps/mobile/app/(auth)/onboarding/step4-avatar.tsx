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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { 
    FadeInDown,
    FadeIn,
    FadeInRight,
} from 'react-native-reanimated';
import { 
    ArrowLeft, 
    ArrowRight, 
    Check,
    User,
    Sun,
    Leaf,
    Gem,
    Flame,
    Waves
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

const AVATARS = [
    { id: '1', icon: User, label: 'The Explorer' },
    { id: '2', icon: Sun, label: 'The Luminary' },
    { id: '3', icon: Leaf, label: 'The Naturalist' },
    { id: '4', icon: Gem, label: 'The Diamond' },
    { id: '5', icon: Flame, label: 'The Catalyst' },
    { id: '6', icon: Waves, label: 'The Serene' },
];

export default function Step4Avatar() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { avatarId, setAvatarId } = useOnboardingStore();

    const handleNext = () => {
        if (avatarId) {
            router.push('/onboarding/step5-focus');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <AmbientBackground minimal={true} />
            <View style={[styles.content, { 
                paddingTop: insets.top + (height > 800 ? 40 : 20), 
                paddingBottom: insets.bottom + 20 
            }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                    </Pressable>
                    <ProgressDots currentStep={4} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        Define your identity
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        Select an icon that reflects your essence within the VinR circle.
                    </Animated.Text>
                </View>

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
                                entering={FadeInDown.duration(1000).delay(600 + index * 50).springify().damping(15)}
                                style={styles.avatarWrapper}
                            >
                                <Pressable
                                    onPress={() => setAvatarId(avatar.id)}
                                    style={({ pressed }) => [
                                        styles.avatarPressable,
                                        pressed && styles.avatarPressed
                                    ]}
                                >
                                    <GlassCard 
                                        accent={isSelected ? 'gold' : undefined} 
                                        glow={isSelected}
                                        style={styles.cardInternal}
                                    >
                                        <View style={styles.avatarCard}>
                                            {isSelected && (
                                                <Animated.View 
                                                    entering={FadeIn.duration(400)}
                                                    style={[styles.checkIcon, { backgroundColor: colors.gold }]}
                                                >
                                                    <Check size={12} color={colors.void} strokeWidth={4} />
                                                </Animated.View>
                                            )}
                                            <AvatarIcon 
                                                size={40} 
                                                color={isSelected ? colors.gold : colors.textGhost} 
                                                strokeWidth={1.5}
                                            />
                                            <Text style={[
                                                styles.label,
                                                { color: isSelected ? colors.gold : colors.textSecondary },
                                                isSelected && styles.labelSelected
                                            ]}>
                                                {avatar.label}
                                            </Text>
                                        </View>
                                    </GlassCard>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(1000).delay(800).springify().damping(15)}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                avatarId 
                                    ? { backgroundColor: colors.gold } 
                                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                                pressed && avatarId && styles.buttonPressed,
                                !avatarId && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!avatarId}
                        >
                            <Text style={[
                                styles.buttonText,
                                { color: avatarId ? colors.void : colors.textGhost }
                            ]}>
                                Continue
                            </Text>
                            <ArrowRight 
                                size={20} 
                                color={avatarId ? colors.void : colors.textGhost} 
                                strokeWidth={3} 
                            />
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
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
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        lineHeight: 40,
        marginTop: 32,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
        opacity: 0.7,
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
    avatarPressable: {
        width: '100%',
    },
    avatarPressed: {
        transform: [{ scale: 0.97 }],
    },
    cardInternal: {
        width: '100%',
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
        marginTop: 20,
    },
    button: {
        width: '100%',
        height: 64,
        borderRadius: 16,
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
        opacity: 0.3,
    },
    buttonText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
});

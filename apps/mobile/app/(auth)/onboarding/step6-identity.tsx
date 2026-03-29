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
import { ArrowLeft, ArrowRight, User } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width } = Dimensions.get('window');

const IDENTITIES = [
    { id: 'student', label: 'Student', icon: '🎓' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: '🚀' },
    { id: 'athlete', label: 'Athlete', icon: '🏃' },
    { id: 'techie', label: 'Techie', icon: '💻' },
    { id: 'other', label: 'Explorer', icon: '🌀' },
];

export default function Step6Identity() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { identity, setIdentity } = useOnboardingStore();

    const handleNext = () => {
        if (identity) {
            router.push('/onboarding/step7-frequency');
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
                    <ProgressDots currentStep={6} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        Who are you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Pick the role that best defines your daily life. This helps us personalize your mindfulness sessions.
                    </Animated.Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.grid}>
                        {IDENTITIES.map((item, index) => {
                            const isSelected = identity === item.id;
                            return (
                                <Animated.View 
                                    key={item.id}
                                    entering={FadeInRight.duration(600).delay(500 + index * 50).springify()}
                                    style={styles.gridItem}
                                >
                                    <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.identityCard,
                                                pressed && styles.identityCardPressed
                                            ]}
                                            onPress={() => setIdentity(item.id)}
                                        >
                                            <Text style={styles.icon}>{item.icon}</Text>
                                            <Text style={[
                                                styles.cardLabel,
                                                isSelected && styles.cardLabelSelected
                                            ]}>
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    </GlassCard>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(1000).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !identity && styles.buttonDisabled,
                                pressed && identity && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!identity}
                        >
                            <LinearGradient
                                colors={identity ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !identity && { color: '#666' }
                                ]}>
                                    That's Me
                                </Text>
                                <ArrowRight size={20} color={identity ? theme.colors.void : '#666'} strokeWidth={3} />
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
        marginBottom: 8,
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
    scrollContent: {
        paddingVertical: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 16,
    },
    identityCard: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1,
        position: 'relative',
    },
    identityCardPressed: {
        transform: [{ scale: 0.96 }],
    },
    icon: {
        fontSize: 40,
        marginBottom: 12,
    },
    cardLabel: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 15,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    cardLabelSelected: {
        color: theme.colors.gold,
    },
    footer: {
        marginTop: 10,
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

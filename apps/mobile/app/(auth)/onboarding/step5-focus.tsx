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

const GOALS = [
    { id: 'stress', label: 'Reduce Stress & Anxiety', icon: '🧘', color: '#E1BEE7' },
    { id: 'focus', label: 'Sharpen Focus', icon: '🎯', color: '#BBDEFB' },
    { id: 'self_care', label: 'Daily Self-Care', icon: '✨', color: '#FFF9C4' },
    { id: 'discipline', label: 'Build Discipline', icon: '⚔️', color: '#FFCCBC' },
    { id: 'productivity', label: 'Boost Productivity', icon: '⚡', color: '#C8E6C9' },
    { id: 'mindfulness', label: 'Daily Mindfulness', icon: '🌿', color: '#DCEDC8' },
];

export default function Step5Focus() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { focusAreas, setFocusAreas } = useOnboardingStore();

    const toggleGoal = (id: string) => {
        if (focusAreas.includes(id)) {
            setFocusAreas(focusAreas.filter(g => g !== id));
        } else {
            setFocusAreas([...focusAreas, id]);
        }
    };

    const handleNext = () => {
        if (focusAreas.length > 0) {
            router.push('/onboarding/step6-identity');
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
                    <ProgressDots currentStep={5} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        What's your focus?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Select the areas you'd like to improve. We'll personalize your daily journey based on your choices.
                    </Animated.Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {GOALS.map((goal, index) => {
                        const isSelected = focusAreas.includes(goal.id);
                        return (
                            <Animated.View 
                                key={goal.id}
                                entering={FadeInRight.duration(600).delay(500 + index * 100).springify()}
                                style={styles.goalWrapper}
                            >
                                <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.goalCard,
                                            pressed && styles.goalCardPressed
                                        ]}
                                        onPress={() => toggleGoal(goal.id)}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
                                            <Text style={styles.icon}>{goal.icon}</Text>
                                        </View>
                                        <Text style={[
                                            styles.label,
                                            isSelected && styles.labelSelected
                                        ]}>
                                            {goal.label}
                                        </Text>
                                        
                                        <View style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected
                                        ]}>
                                            {isSelected && <Check size={12} color={theme.colors.void} strokeWidth={4} />}
                                        </View>
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
                                focusAreas.length === 0 && styles.buttonDisabled,
                                pressed && focusAreas.length > 0 && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={focusAreas.length === 0}
                        >
                            <LinearGradient
                                colors={focusAreas.length > 0 ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    focusAreas.length === 0 && { color: '#666' }
                                ]}>
                                    Set Focus
                                </Text>
                                <ArrowRight size={20} color={focusAreas.length > 0 ? theme.colors.void : '#666'} strokeWidth={3} />
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
        marginBottom: 16,
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
        paddingVertical: 16,
        gap: 16,
    },
    goalWrapper: {
        width: '100%',
    },
    goalCard: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    goalCardPressed: {
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 16,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    labelSelected: {
        color: theme.colors.gold,
        fontFamily: 'DMSans_700Bold',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: theme.colors.gold,
        borderColor: theme.colors.gold,
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

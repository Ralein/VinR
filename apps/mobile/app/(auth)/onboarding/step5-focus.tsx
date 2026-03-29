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
    FadeInRight,
} from 'react-native-reanimated';
import { 
    ArrowLeft, 
    ArrowRight, 
    Check,
    Wind,
    Target,
    Sparkles,
    Shield,
    Zap,
    Brain
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

const GOALS = [
    { id: 'stress', label: 'Reduce Stress & Anxiety', icon: Wind },
    { id: 'focus', label: 'Sharpen Focus', icon: Target },
    { id: 'self_care', label: 'Daily Self-Care', icon: Sparkles },
    { id: 'discipline', label: 'Build Discipline', icon: Shield },
    { id: 'productivity', label: 'Boost Productivity', icon: Zap },
    { id: 'mindfulness', label: 'Daily Mindfulness', icon: Brain },
];

export default function Step5Focus() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
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
                    <ProgressDots currentStep={5} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        Focus your intent
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        What disciplines shall we refine? Your choice shapes your daily VinR experience.
                    </Animated.Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {GOALS.map((goal, index) => {
                        const isSelected = focusAreas.includes(goal.id);
                        const Icon = goal.icon;
                        return (
                            <Animated.View 
                                key={goal.id}
                                entering={FadeInDown.duration(1000).delay(600 + index * 50).springify().damping(15)}
                                style={styles.goalWrapper}
                            >
                                <Pressable
                                    onPress={() => toggleGoal(goal.id)}
                                    style={({ pressed }) => [
                                        styles.goalPressable,
                                        pressed && styles.goalPressed
                                    ]}
                                >
                                    <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                        <View style={styles.goalCard}>
                                            <View style={[styles.iconContainer, { backgroundColor: isSelected ? `${colors.gold}15` : colors.surface }]}>
                                                <Icon size={24} color={isSelected ? colors.gold : colors.textGhost} strokeWidth={1.5} />
                                            </View>
                                            <Text style={[
                                                styles.label,
                                                { color: isSelected ? colors.gold : colors.textPrimary },
                                                isSelected && styles.labelSelected
                                            ]}>
                                                {goal.label}
                                            </Text>
                                            
                                            <View style={[
                                                styles.checkbox,
                                                { borderColor: isSelected ? colors.gold : colors.border },
                                                isSelected && { backgroundColor: colors.gold }
                                            ]}>
                                                {isSelected && <Check size={12} color={colors.void} strokeWidth={4} />}
                                            </View>
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
                                focusAreas.length > 0 
                                    ? { backgroundColor: colors.gold } 
                                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                                pressed && focusAreas.length > 0 && styles.buttonPressed,
                                focusAreas.length === 0 && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={focusAreas.length === 0}
                        >
                            <Text style={[
                                styles.buttonText,
                                { color: focusAreas.length > 0 ? colors.void : colors.textGhost }
                            ]}>
                                Set Focus
                            </Text>
                            <ArrowRight 
                                size={20} 
                                color={focusAreas.length > 0 ? colors.void : colors.textGhost} 
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
        paddingVertical: 16,
        gap: 16,
    },
    goalWrapper: {
        width: '100%',
    },
    goalPressable: {
        width: '100%',
    },
    goalPressed: {
        transform: [{ scale: 0.985 }],
    },
    goalCard: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    label: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 16,
        flex: 1,
    },
    labelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
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

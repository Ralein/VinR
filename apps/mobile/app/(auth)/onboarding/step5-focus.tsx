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
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, { 
    FadeInDown,
    FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';

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
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.textSecondary} />
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
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.goalCard,
                                        isSelected && styles.goalCardSelected,
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
                                        {isSelected && <Check size={12} color={Colors.void} strokeWidth={4} />}
                                    </View>

                                    {isSelected && (
                                        <LinearGradient
                                            colors={['rgba(212, 175, 55, 0.1)', 'transparent']}
                                            style={styles.cardGradient}
                                        />
                                    )}
                                </Pressable>
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
                                colors={focusAreas.length > 0 ? [Colors.gold, '#B8860B'] : ['#333', '#222']}
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
                                <ArrowRight size={20} color={focusAreas.length > 0 ? Colors.void : '#666'} strokeWidth={3} />
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
        backgroundColor: Colors.void,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
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
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: 32,
        fontSize: 32,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
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
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
    },
    goalCardSelected: {
        borderColor: Colors.gold,
        backgroundColor: '#252115',
    },
    goalCardPressed: {
        transform: [{ scale: 0.98 }],
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
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
        color: Colors.textPrimary,
        flex: 1,
    },
    labelSelected: {
        color: Colors.gold,
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
        backgroundColor: Colors.gold,
        borderColor: Colors.gold,
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
        color: Colors.void,
        letterSpacing: 0.5,
    },
});

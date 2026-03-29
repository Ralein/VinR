import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, { 
    FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const COMMITMENTS = [
    { id: '1-2', label: '1-2 days / week', sub: 'Starting slow and steady' },
    { id: '3-5', label: '3-5 days / week', sub: 'Building a consistent habit' },
    { id: 'daily', label: 'Every day', sub: 'Total lifestyle transformation' },
];

export default function Step7Frequency() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { dailyTime, setDailyTime } = useOnboardingStore();

    // Note: Reusing dailyTime store key for commitment frequency for now 
    // to maintain compatibility with existing store structure if possible,
    // or we can update the store later.
    
    const handleNext = () => {
        if (dailyTime) {
            router.push('/(auth)/onboarding/step8-reminder');
        }
    };

    return (
        <View style={styles.container}>
            <AmbientBackground />
            <View style={[styles.content, { paddingTop: Math.max(insets.top + 40, 40), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                    <ProgressDots currentStep={7} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        Commitment
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        How often do you want to practice? We'll help you stay on track with gentle reminders.
                    </Animated.Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {COMMITMENTS.map((item, index) => {
                        const isSelected = dailyTime === item.id;
                        return (
                            <Animated.View 
                                key={item.id}
                                entering={FadeInDown.duration(600).delay(500 + index * 100).springify()}
                                style={styles.optionWrapper}
                            >
                                <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.optionCard,
                                            pressed && styles.optionCardPressed
                                        ]}
                                        onPress={() => setDailyTime(item.id)}
                                    >
                                        <View style={styles.optionInfo}>
                                            <Text style={[
                                                styles.optionLabel,
                                                isSelected && styles.optionLabelSelected
                                            ]}>
                                                {item.label}
                                            </Text>
                                            <Text style={styles.optionSub}>
                                                {item.sub}
                                            </Text>
                                        </View>
                                        
                                        <View style={[
                                            styles.radio,
                                            isSelected && styles.radioSelected
                                        ]}>
                                            {isSelected && <View style={styles.radioInner} />}
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
                                !dailyTime && styles.buttonDisabled,
                                pressed && dailyTime && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!dailyTime}
                        >
                            <LinearGradient
                                colors={dailyTime ? [theme.colors.gold, theme.colors.goldLight] : [theme.colors.elevated, theme.colors.surface]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !dailyTime && { color: '#666' }
                                ]}>
                                    Set Goal
                                </Text>
                                <ArrowRight size={20} color={dailyTime ? theme.colors.void : '#666'} strokeWidth={3} />
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
    optionWrapper: {
        marginBottom: 16,
    },
    optionCard: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    optionCardPressed: {
        transform: [{ scale: 0.98 }],
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    optionLabelSelected: {
        color: theme.colors.gold,
    },
    optionSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    radioSelected: {
        borderColor: theme.colors.gold,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.gold,
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

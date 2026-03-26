import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import Animated, { 
    FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react-native';

const COMMITMENTS = [
    { id: '1-2', label: '1-2 days / week', sub: 'Starting slow and steady' },
    { id: '3-5', label: '3-5 days / week', sub: 'Building a consistent habit' },
    { id: 'daily', label: 'Every day', sub: 'Total lifestyle transformation' },
];

export default function Step7Frequency() {
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
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.textSecondary} />
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
                            >
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.optionCard,
                                        isSelected && styles.optionCardSelected,
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

                                    {isSelected && (
                                        <LinearGradient
                                            colors={['rgba(212, 175, 55, 0.1)', 'transparent']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
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
                                !dailyTime && styles.buttonDisabled,
                                pressed && dailyTime && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!dailyTime}
                        >
                            <LinearGradient
                                colors={dailyTime ? [Colors.gold, '#B8860B'] : ['#333', '#222']}
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
                                <ArrowRight size={20} color={dailyTime ? Colors.void : '#666'} strokeWidth={3} />
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
    scrollContent: {
        paddingVertical: 20,
    },
    optionCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: Colors.gold,
        backgroundColor: '#252115',
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
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    optionLabelSelected: {
        color: Colors.gold,
    },
    optionSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: Colors.textSecondary,
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
        borderColor: Colors.gold,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.gold,
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
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
        color: Colors.void,
        letterSpacing: 0.5,
    },
});

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
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';

const { width, height } = Dimensions.get('window');

const COMMITMENTS = [
    { id: '1-2', label: '1-2 days / week', sub: 'The balanced introduction' },
    { id: '3-5', label: '3-5 days / week', sub: 'The path of discipline' },
    { id: 'daily', label: 'Every day', sub: 'The standard of excellence' },
];

export default function Step7Frequency() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { dailyTime, setDailyTime } = useOnboardingStore();
    
    const handleNext = () => {
        if (dailyTime) {
            router.push('/onboarding/step8-reminder');
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
                    <ProgressDots currentStep={7} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}
                        style={[styles.title, { color: colors.textPrimary }]}
                    >
                        Define your pace
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}
                        style={[styles.subtitle, { color: colors.textSecondary }]}
                    >
                        Consistency is the bedrock of refinement. How often shall you dedicate yourself to VinR?
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
                                entering={FadeInDown.duration(1000).delay(600 + index * 100).springify().damping(15)}
                                style={styles.optionWrapper}
                            >
                                <Pressable
                                    onPress={() => setDailyTime(item.id)}
                                    style={({ pressed }) => [
                                        styles.optionPressable,
                                        pressed && styles.optionPressed
                                    ]}
                                >
                                    <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                        <View style={styles.optionCard}>
                                            <View style={styles.optionInfo}>
                                                <Text style={[
                                                    styles.optionLabel,
                                                    { color: isSelected ? colors.gold : colors.textPrimary },
                                                    isSelected && styles.optionLabelSelected
                                                ]}>
                                                    {item.label}
                                                </Text>
                                                <Text style={[styles.optionSub, { color: colors.textSecondary, opacity: 0.6 }]}>
                                                    {item.sub}
                                                </Text>
                                            </View>
                                            
                                            <View style={[
                                                styles.radio,
                                                { borderColor: isSelected ? colors.gold : colors.border },
                                            ]}>
                                                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.gold }]} />}
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
                                dailyTime 
                                    ? { backgroundColor: colors.gold } 
                                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                                pressed && dailyTime && styles.buttonPressed,
                                !dailyTime && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!dailyTime}
                        >
                            <Text style={[
                                styles.buttonText,
                                { color: dailyTime ? colors.void : colors.textGhost }
                            ]}>
                                Set Frequency
                            </Text>
                            <ArrowRight 
                                size={20} 
                                color={dailyTime ? colors.void : colors.textGhost} 
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
    scrollContent: {
        paddingVertical: 20,
    },
    optionWrapper: {
        marginBottom: 16,
    },
    optionPressable: {
        width: '100%',
    },
    optionPressed: {
        transform: [{ scale: 0.985 }],
    },
    optionCard: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 18,
        marginBottom: 6,
    },
    optionLabelSelected: {
        fontFamily: 'DMSans_700Bold',
    },
    optionSub: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    footer: {
        width: '100%',
        marginTop: 10,
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

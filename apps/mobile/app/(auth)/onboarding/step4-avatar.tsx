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

const AVATARS = [
    { id: '1', emoji: '🧘‍♂️', label: 'Zen Master' },
    { id: '2', emoji: '🌟', label: 'Radiant Soul' },
    { id: '3', emoji: '🌿', label: 'Nature Lover' },
    { id: '4', emoji: '💎', label: 'Clear Diamond' },
    { id: '5', emoji: '🔥', label: 'Phoenix' },
    { id: '6', emoji: '🌊', label: 'Calm Wave' },
];

export default function Step4Avatar() {
    const router = useRouter();
    const { avatarId, setAvatarId } = useOnboardingStore();

    const handleNext = () => {
        if (avatarId) {
            router.push('/onboarding/step5-focus');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.textSecondary} />
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
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.avatarCard,
                                        isSelected && styles.avatarCardSelected,
                                        pressed && styles.avatarCardPressed
                                    ]}
                                    onPress={() => setAvatarId(avatar.id)}
                                >
                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <Check size={12} color={Colors.void} strokeWidth={4} />
                                        </View>
                                    )}
                                    <Text style={styles.emoji}>{avatar.emoji}</Text>
                                    <Text style={[
                                        styles.label,
                                        isSelected && styles.labelSelected
                                    ]}>
                                        {avatar.label}
                                    </Text>
                                    
                                    {isSelected && (
                                        <LinearGradient
                                            colors={['rgba(212, 175, 55, 0.2)', 'transparent']}
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
                                !avatarId && styles.buttonDisabled,
                                pressed && avatarId && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!avatarId}
                        >
                            <LinearGradient
                                colors={avatarId ? [Colors.gold, '#B8860B'] : ['#333', '#222']}
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
                                <ArrowRight size={20} color={avatarId ? Colors.void : '#666'} strokeWidth={3} />
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
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        height: 160,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    avatarCardSelected: {
        borderColor: Colors.gold,
        backgroundColor: '#252115',
    },
    avatarCardPressed: {
        transform: [{ scale: 0.97 }],
    },
    cardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.gold,
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
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    labelSelected: {
        color: Colors.gold,
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
        color: Colors.void,
        letterSpacing: 0.5,
    },
});

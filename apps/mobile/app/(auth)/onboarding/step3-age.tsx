import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Pressable, 
    KeyboardAvoidingView, 
    Platform,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import Animated, { 
    FadeInDown, 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Step3Age() {
    const router = useRouter();
    const [age, setAge] = useState('');

    const handleNext = () => {
        if (age.length > 0) {
            router.push('/onboarding/step4-avatar');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={Colors.textSecondary} />
                    </Pressable>
                    <ProgressDots currentStep={3} totalSteps={9} />
                    
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(200).springify()}
                        style={styles.title}
                    >
                        How old are you?
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeInDown.duration(800).delay(400).springify()}
                        style={styles.subtitle}
                    >
                        Your age helps us personalize your journey and connect you with the right community.
                    </Animated.Text>
                </View>

                <Animated.View 
                    entering={FadeInDown.duration(800).delay(600).springify()}
                    style={styles.inputSection}
                >
                    <View style={styles.ageInputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="00"
                            placeholderTextColor="rgba(212, 175, 55, 0.2)"
                            value={age}
                            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, '').slice(0, 2))}
                            keyboardType="number-pad"
                            maxLength={2}
                            autoFocus
                            selectionColor={Colors.gold}
                        />
                        <Text style={styles.yearsText}>years old</Text>
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !isAgeValid && styles.buttonDisabled,
                                pressed && isAgeValid && styles.buttonPressed
                            ]}
                            onPress={handleNext}
                            disabled={!isAgeValid}
                        >
                            <LinearGradient
                                colors={isAgeValid ? [Colors.gold, '#B8860B'] : ['#333', '#222']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    !isAgeValid && { color: '#666' }
                                ]}>
                                    Continue
                                </Text>
                                <ArrowRight size={20} color={isAgeValid ? Colors.void : '#666'} strokeWidth={3} />
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        marginTop: 0,
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
    inputSection: {
        marginTop: 80,
        flex: 1,
        alignItems: 'center',
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 16,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 120,
        color: Colors.gold,
        textAlign: 'center',
        minWidth: 150,
        // Using a subtle text shadow for a more premium look
        textShadowColor: 'rgba(212, 175, 55, 0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    yearsText: {
        ...Typography.h3,
        color: Colors.textSecondary,
        fontSize: 24,
    },
    footer: {
        marginTop: 'auto',
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

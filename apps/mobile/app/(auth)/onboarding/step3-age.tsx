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
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressDots } from '../../../components/onboarding/ProgressDots';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { 
    FadeInDown, 
    FadeIn,
} from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Step3Age() {
    const { colors, fonts, borderRadius, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [age, setAge] = useState('');

    const handleNext = () => {
        if (age.length > 0 && isAgeValid) {
            router.push('/onboarding/step4-avatar');
        }
    };

    const isAgeValid = parseInt(age) >= 13 && parseInt(age) <= 100;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor: colors.void }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <AmbientBackground minimal={true} />
            
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.flexFill}>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={[styles.header, { marginTop: insets.top + 20 }]}>
                            <Pressable onPress={() => router.back()} style={styles.backButton}>
                                <ArrowLeft size={24} color={colors.textSecondary} strokeWidth={1.5} />
                            </Pressable>
                            <ProgressDots currentStep={3} totalSteps={9} />
                            
                            <Animated.View entering={FadeInDown.duration(800).delay(200).springify()}>
                                <Text style={[styles.title, { color: colors.textPrimary }]}>
                                    How old are you?
                                </Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.duration(800).delay(400).springify()}>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    VinR tailored experiences align with your stage of life.
                                </Text>
                            </Animated.View>
                        </View>

                        <View style={styles.inputSection}>
                            <Animated.View 
                                entering={FadeInDown.duration(800).delay(600).springify()}
                                style={{ alignItems: 'center' }}
                            >
                                <GlassCard accent={isAgeValid ? 'gold' : undefined} shimmer={age.length > 0} >
                                    <View style={styles.ageInputContainer}>
                                        <TextInput
                                            style={[styles.input, { color: colors.gold, fontFamily: 'DMSans_700Bold' }]}
                                            placeholder="00"
                                            placeholderTextColor={`${colors.gold}20`}
                                            value={age}
                                            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, '').slice(0, 2))}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            autoFocus
                                            selectionColor={colors.gold}
                                        />
                                        <Text style={[styles.yearsText, { color: colors.textSecondary, fontFamily: fonts.body }]}>years</Text>
                                    </View>
                                </GlassCard>
                                {!isAgeValid && age.length === 2 && (
                                    <Animated.View entering={FadeIn}>
                                        <Text style={[styles.errorText, { color: colors.crimson, fontFamily: fonts.body }]}>
                                            Must be 13 or older.
                                        </Text>
                                    </Animated.View>
                                )}
                            </Animated.View>
                        </View>

                        <View style={{ flex: 1 }} />
                        
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                            <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                                <Pressable 
                                    onPress={handleNext}
                                    style={({ pressed }) => [
                                        styles.button,
                                        { backgroundColor: colors.gold },
                                        pressed && styles.buttonPressed,
                                        !isAgeValid && styles.buttonDisabled
                                    ]}
                                    disabled={!isAgeValid}
                                >
                                    <LinearGradient
                                        colors={isAgeValid ? [colors.goldLight, colors.gold, colors.gold] : [`${colors.gold}20`, `${colors.gold}10`]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Text style={[styles.buttonText, { color: isAgeValid ? colors.void : colors.textGhost }]}>
                                        CONTINUE
                                    </Text>
                                    <ArrowRight size={20} color={isAgeValid ? colors.void : colors.textGhost} />
                                </Pressable>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flexFill: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
    },
    header: {
        marginBottom: 0,
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
        fontSize: 34,
        lineHeight: 42,
        marginTop: 32,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
        opacity: 0.7,
    },
    inputSection: {
        marginTop: 60,
        flex: 1,
        alignItems: 'center',
    },
    ageInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    input: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 100,
        textAlign: 'center',
        minWidth: 120,
    },
    yearsText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 24,
        marginLeft: 16,
    },
    errorText: {
        marginTop: 16,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
    },
    footer: {
        width: '100%',
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

import React, { useState, useEffect } from 'react';
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
    FadeIn, 
    FadeInDown, 
    FadeOut,
} from 'react-native-reanimated';
import { User, ArrowRight, Check } from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Step2Name() {
    const { colors, fonts, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleNext = () => {
        if (name.trim().length >= 2) {
            router.push('/onboarding/step3-age');
        }
    };

    const isNameValid = name.trim().length >= 2;

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
                        <View style={[styles.header, { marginTop: insets.top + 40 }]}>
                            <ProgressDots currentStep={2} totalSteps={9} />
                            
                            <Animated.View entering={FadeInDown.duration(800).delay(200).springify()}>
                                <Text style={[styles.title, { color: colors.textPrimary }]}>
                                    How shall we address you?
                                </Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.duration(800).delay(400).springify()}>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Your digital legacy begins with a name.
                                </Text>
                            </Animated.View>
                        </View>

                        <View style={styles.inputSection}>
                            <Animated.View entering={FadeInDown.duration(800).delay(600).springify()}>
                                <GlassCard accent={isFocused ? 'gold' : undefined} glow={isFocused}>
                                    <View style={styles.inputContainer}>
                                        <View style={[styles.iconWrapper, { backgroundColor: `${colors.gold}15` }]}>
                                            <User size={22} color={isFocused ? colors.gold : colors.textGhost} strokeWidth={1.5} />
                                        </View>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}
                                            placeholder="Full Name"
                                            placeholderTextColor={colors.textGhost}
                                            value={name}
                                            onChangeText={setName}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            autoFocus
                                            autoCorrect={false}
                                            selectionColor={colors.gold}
                                        />
                                        {isNameValid && (
                                            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.validBadge}>
                                                <Check size={14} color={colors.gold} strokeWidth={4} />
                                            </Animated.View>
                                        )}
                                    </View>
                                </GlassCard>
                            </Animated.View>
                        </View>

                        {/* Spacer to push footer to bottom in scroll area */}
                        <View style={{ flex: 1 }} />
                        
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                            <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                                <Pressable 
                                    onPress={handleNext}
                                    style={({ pressed }) => [
                                        styles.button,
                                        { backgroundColor: colors.gold },
                                        pressed && styles.buttonPressed,
                                        !isNameValid && styles.buttonDisabled
                                    ]}
                                    disabled={!isNameValid}
                                >
                                    <LinearGradient
                                        colors={isNameValid ? [colors.goldLight, colors.gold, colors.gold] : [`${colors.gold}20`, `${colors.gold}10`]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Text style={[styles.buttonText, { color: isNameValid ? colors.void : colors.textGhost }]}>
                                        CONTINUE
                                    </Text>
                                    <ArrowRight size={20} color={isNameValid ? colors.void : colors.textGhost} />
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
        marginBottom: 40,
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
        marginTop: 20,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'DMSans_500Medium',
        fontSize: 18,
    },
    validBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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

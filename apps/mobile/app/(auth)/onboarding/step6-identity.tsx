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
    GraduationCap,
    Briefcase,
    Palette,
    Heart,
    Rocket,
    Activity,
    Cpu,
    Compass
} from 'lucide-react-native';
import GlassCard from '../../../components/ui/GlassCard';
import AmbientBackground from '../../../components/ui/AmbientBackground';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const IDENTITIES = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'creative', label: 'Creative', icon: Palette },
    { id: 'parent', label: 'Parent', icon: Heart },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: Rocket },
    { id: 'athlete', label: 'Athlete', icon: Activity },
    { id: 'techie', label: 'Techie', icon: Cpu },
    { id: 'other', label: 'Explorer', icon: Compass },
];

export default function Step6Identity() {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { identity, setIdentity } = useOnboardingStore();

    const handleNext = () => {
        if (identity) {
            router.push('/onboarding/step7-frequency');
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
                    <ProgressDots currentStep={6} totalSteps={9} />
                    
                    <Animated.View entering={FadeInDown.duration(1000).delay(200).springify().damping(15)}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Identify your role
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.duration(1000).delay(400).springify().damping(15)}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Which path defines your daily rhythm? We tailor the VinR experience to your lifestyle.
                        </Text>
                    </Animated.View>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.grid}>
                        {IDENTITIES.map((item, index) => {
                            const isSelected = identity === item.id;
                            const Icon = item.icon;
                            return (
                                <Animated.View 
                                    key={item.id}
                                    entering={FadeInDown.duration(1000).delay(600 + index * 50).springify().damping(15)}
                                    style={styles.gridItem}
                                >
                                    <Pressable
                                        onPress={() => setIdentity(item.id)}
                                        style={({ pressed }) => [
                                            styles.identityPressable,
                                            pressed && styles.identityPressed
                                        ]}
                                    >
                                        <GlassCard accent={isSelected ? 'gold' : undefined} glow={isSelected}>
                                            <View style={styles.identityCard}>
                                                <View style={[styles.iconWrapper, { backgroundColor: isSelected ? `${colors.gold}15` : colors.surface }]}>
                                                    <Icon size={32} color={isSelected ? colors.gold : colors.textGhost} strokeWidth={1.5} />
                                                </View>
                                                <Text style={[
                                                    styles.cardLabel,
                                                    { color: isSelected ? colors.gold : colors.textPrimary },
                                                    isSelected && styles.cardLabelSelected
                                                ]}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                        </GlassCard>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: 20 }]}>
                    <Animated.View entering={FadeInDown.duration(800).delay(800).springify()}>
                        <Pressable 
                            onPress={handleNext}
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.gold },
                                pressed && styles.buttonPressed,
                                !identity && styles.buttonDisabled
                            ]}
                            disabled={!identity}
                        >
                            <LinearGradient
                                colors={identity ? [colors.goldLight, colors.gold, colors.gold] : [`${colors.gold}20`, `${colors.gold}10`]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <Text style={[styles.buttonText, { color: identity ? colors.void : colors.textGhost }]}>
                                CONFIRM PATH
                            </Text>
                            <ArrowRight size={20} color={identity ? colors.void : colors.textGhost} />
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 16,
    },
    identityPressable: {
        width: '100%',
    },
    identityPressed: {
        transform: [{ scale: 0.97 }],
    },
    identityCard: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardLabel: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 15,
        textAlign: 'center',
    },
    cardLabelSelected: {
        fontFamily: 'DMSans_700Bold',
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

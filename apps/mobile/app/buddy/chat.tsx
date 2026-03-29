import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Send, Mic, Sparkles, Brain, User as UserIcon, Volume2, Info, Bot, Heart, Zap, ShieldCheck, Trash2, Lock, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
    FadeInDown, FadeInUp, FadeIn, FadeOut, 
    Layout, useAnimatedStyle, withRepeat, withSequence, 
    withTiming, useSharedValue, withSpring, interpolate, Extrapolate 
} from 'react-native-reanimated';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import AudioService from '../../services/audio_service';

const SafeHaptics = {
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
        Soft: 'soft',
        Rigid: 'rigid',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
    impactAsync: async (style: string) => {
        try {
            const Haptics = await import('expo-haptics');
            // Map our local strings to the actual enum values if needed, 
            // but expo-haptics usually accepts these strings in modern versions 
            // or we can use the enum from the imported object.
            const styleEnum = style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
                              style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
                              style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
                              Haptics.ImpactFeedbackStyle.Medium;
            return await Haptics.impactAsync(styleEnum);
        } catch (e) {
            console.warn("Haptics not available");
        }
    },
    notificationAsync: async (type: string) => {
        try {
            const Haptics = await import('expo-haptics');
            const typeEnum = type === 'success' ? Haptics.NotificationFeedbackType.Success :
                             type === 'warning' ? Haptics.NotificationFeedbackType.Warning :
                             type === 'error' ? Haptics.NotificationFeedbackType.Error :
                             Haptics.NotificationFeedbackType.Success;
            return await Haptics.notificationAsync(typeEnum);
        } catch (e) {
            console.warn("Haptics not available");
        }
    }
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SafeBlurView = (props: any) => {
    const { isDark } = useTheme();
    try {
        return <BlurView {...props} tint={isDark ? "dark" : "light"} />;
    } catch (e) {
        return <View {...props} />;
    }
};

const SafeAudio = {
    Sound: {
        createAsync: async (source: any, initialStatus?: any, onPlaybackStatusUpdate?: any, downloadFirst?: boolean) => {
            try {
                const { Audio } = await import('expo-av');
                return await Audio.Sound.createAsync(source, initialStatus, onPlaybackStatusUpdate, downloadFirst);
            } catch (e) {
                console.warn("Audio not available in this environment", e);
                return { sound: { unloadAsync: async () => {}, playAsync: async () => {}, setStatusAsync: async () => {} } };
            }
        }
    }
};

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
    persona?: PersonaType;
}

type PersonaType = 'sara' | 'alex' | 'vinr' | 'therapist' | 'coach';

const PERSONAS: { id: PersonaType; name: string; icon: any; color: string; bio: string }[] = [
    { id: 'sara', name: 'Sara', icon: Sparkles, color: '#D4A853', bio: '🌿 Kind & Calm' },
    { id: 'alex', name: 'Alex', icon: Brain, color: '#4F46E5', bio: '🧠 Nerd & Playful' },
    { id: 'vinr', name: 'VinR', icon: Bot, color: '#10B981', bio: '🤖 Smart & Direct' },
    { id: 'therapist', name: 'Dr. Aris', icon: ShieldCheck, color: '#EC4899', bio: '🫂 Clinical Support' },
    { id: 'coach', name: 'Coach', icon: Zap, color: '#F59E0B', bio: '🔥 High Energy' }
];

export default function ChatScreen() {
    const { colors, spacing, borderRadius, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const [persona, setPersona] = useState<PersonaType>('sara');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Sara, your kind and calm VinR Buddy. I'm here to listen. How are you feeling today?",
            persona: 'sara'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const audioRef = useRef<any>(null);

    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Animation Shared Values
    const micScale = useSharedValue(1);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const lockProgress = useSharedValue(0); // 0 to 1
    const cancelProgress = useSharedValue(0); // 0 to 1

    useEffect(() => {
        if (isLoading) {
            micScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            micScale.value = withTiming(1);
        }
    }, [isLoading]);

    const animatedMicStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: micScale.value },
            { translateX: isLocked ? 0 : dragX.value },
            { translateY: isLocked ? 0 : dragY.value }
        ],
        opacity: interpolate(cancelProgress.value, [0, 0.8], [1, 0], Extrapolate.CLAMP)
    }));

    const lockIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(lockProgress.value, [0, 1], [0, -40], Extrapolate.CLAMP) }],
        opacity: interpolate(lockProgress.value, [0, 0.5], [0.3, 1], Extrapolate.CLAMP)
    }));

    const cancelIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(cancelProgress.value, [0, 1], [0, -40], Extrapolate.CLAMP) }],
        opacity: interpolate(cancelProgress.value, [0, 0.5], [0.3, 1], Extrapolate.CLAMP)
    }));

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) audioRef.current.unloadAsync();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const playAudio = async (uri: string) => {
        try {
            if (audioRef.current) await audioRef.current.unloadAsync();
            const { sound } = await SafeAudio.Sound.createAsync({ uri });
            audioRef.current = sound;
            await (sound as any).playAsync();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input.trim();
        if (!textToSend || isLoading) return;
        
        if (!textOverride) setInput('');
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
        setMessages(prev => [...prev.slice(-19), userMsg]);
        setIsLoading(true);

        try {
            const res = await api.post('/chat/message', { 
                text: textToSend,
                voice_enabled: audioEnabled,
                persona: persona
            });

            const aiMsg: Message = {
                id: res.data.buddy_message.id || Date.now().toString(),
                role: 'assistant',
                content: res.data.buddy_message.content,
                audioUrl: res.data.buddy_message.audio_url,
                persona: persona
            };

            setMessages(prev => [...prev.slice(-19), aiMsg]);

            if (aiMsg.audioUrl && audioEnabled) {
                playAudio(aiMsg.audioUrl);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev.slice(-19), {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: "Sorry, I'm having trouble connecting right now. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Voice Recording Logic
    const startRecording = async () => {
        const hasPermission = await AudioService.requestPermissions();
        if (!hasPermission) return;

        SafeHaptics.impactAsync('medium');
        const success = await AudioService.startRecording();
        if (success) {
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopAndSend = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setIsLocked(false);
        dragX.value = withSpring(0);
        dragY.value = withSpring(0);
        lockProgress.value = 0;
        cancelProgress.value = 0;

        const uri = await AudioService.stopRecording();
        if (uri) {
            await processVoiceMessage(uri);
        }
    };

    const cancelRecording = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        SafeHaptics.notificationAsync('warning');
        setIsRecording(false);
        setIsLocked(false);
        dragX.value = withSpring(0);
        dragY.value = withSpring(0);
        lockProgress.value = 0;
        cancelProgress.value = 0;
        await AudioService.cancelRecording();
    };

    const processVoiceMessage = async (uri: string) => {
        setIsLoading(true);
        try {
            // 1. Transcribe
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            } as any);

            const transRes = await api.post('/chat/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (transRes.data.text) {
                await handleSend(transRes.data.text);
            }
        } catch (error) {
            console.error('Voice processing error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const onGestureEvent = (event: any) => {
        const { translationX, translationY } = event.nativeEvent;
        
        if (!isLocked) {
            dragX.value = Math.min(0, translationX);
            dragY.value = Math.min(0, translationY);

            // Calculate lock progress (sliding up)
            lockProgress.value = Math.min(1, Math.abs(translationY) / 80);
            // Calculate cancel progress (sliding left)
            cancelProgress.value = Math.min(1, Math.abs(translationX) / 100);

            if (translationY < -80 && !isLocked) {
                setIsLocked(true);
                lockProgress.value = withSpring(1);
                SafeHaptics.impactAsync('heavy');
            }

            if (translationX < -120) {
                cancelRecording();
            }
        }
    };

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            if (!isLocked) {
                if (cancelProgress.value > 0.8) {
                    cancelRecording();
                } else {
                    stopAndSend();
                }
            }
        }
    };

    const changePersona = (newPersona: PersonaType) => {
        if (newPersona === persona) return;
        setPersona(newPersona);
        const pData = PERSONAS.find(p => p.id === newPersona);
        const welcomeText = `Switching to ${pData?.name}. ${pData?.bio.split(' ').slice(1).join(' ')} mode active.`;
        setMessages(prev => [...prev.slice(-19), {
            id: `switch-${Date.now()}`,
            role: 'assistant' as const,
            content: welcomeText,
            persona: newPersona
        }]);
    };

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isUser = item.role === 'user';
        const msgPersona = item.persona || 'sara';
        const pData = PERSONAS.find(p => p.id === msgPersona);
        const Icon = pData?.icon || Sparkles;
        
        return (
            <Animated.View 
                entering={FadeInDown.delay(index * 50).duration(400)}
                layout={Layout.springify()}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAi]}
            >
                {!isUser && (
                    <View style={[styles.aiAvatar, { backgroundColor: `${pData?.color || colors.gold}15`, borderColor: `${pData?.color || colors.gold}30` }]}>
                        <Icon size={16} color={pData?.color || colors.gold} />
                    </View>
                )}
                <View style={[
                    styles.msgBubble, 
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAi,
                    isUser ? { backgroundColor: colors.sapphire } : { 
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        borderWidth: 1
                    }
                ]}>
                    <Text style={[styles.msgText, isUser ? styles.msgTextUser : { color: colors.textPrimary }]}>
                        {item.content}
                    </Text>
                    {!isUser && item.audioUrl && (
                        <Pressable 
                            onPress={() => playAudio(item.audioUrl!)} 
                            style={[styles.playBtn, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}
                        >
                            <Volume2 size={14} color={pData?.color || colors.gold} />
                            <Text style={[styles.playText, { color: pData?.color || colors.gold }]}>Listen</Text>
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <SafeBlurView intensity={90} style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.surface : colors.elevated }]}>
                    <ChevronLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>VinR Buddy</Text>
                    <View style={styles.onlineStatus} />
                </View>
                <Pressable 
                    onPress={() => setAudioEnabled(!audioEnabled)} 
                    style={[styles.audioToggle, { 
                        backgroundColor: audioEnabled ? `${colors.gold}15` : (isDark ? colors.surface : colors.elevated), 
                        borderColor: audioEnabled ? colors.gold : colors.border,
                        borderWidth: 1.5 
                    }]}
                >
                    <Mic size={20} color={audioEnabled ? colors.gold : colors.textMuted} />
                </Pressable>
            </SafeBlurView>

            {/* Persona Selector */}
            <View style={styles.personaScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personaList}>
                    {PERSONAS.map((p) => {
                        const Icon = p.icon;
                        const isSelected = persona === p.id;
                        return (
                            <Pressable 
                                key={p.id}
                                onPress={() => changePersona(p.id)}
                                style={[styles.personaCard, { 
                                    backgroundColor: isSelected ? `${p.color}15` : (isDark ? colors.surface : colors.elevated),
                                    borderColor: isSelected ? p.color : 'transparent',
                                    borderWidth: 2
                                }]}
                            >
                                <Icon size={20} color={isSelected ? p.color : colors.textMuted} />
                                <Text style={[styles.personaNameLabel, { color: isSelected ? p.color : colors.textPrimary }]}>{p.name}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={[styles.chatContent, { paddingBottom: insets.bottom + 120 }]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={isLoading ? (
                    <Animated.View entering={FadeInUp} style={styles.typingContainer}>
                        <ActivityIndicator size="small" color={colors.gold} />
                        <Text style={[styles.typingText, { color: colors.textMuted }]}>
                            {PERSONAS.find(p => p.id === persona)?.name} is thinking...
                        </Text>
                    </Animated.View>
                ) : null}
            />

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                <SafeBlurView intensity={100} style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20), borderTopColor: colors.border }]}>
                    
                    {isRecording ? (
                        <View style={styles.recordingRow}>
                            <Animated.View style={[styles.recordingIndicator, { backgroundColor: colors.crimson }]} entering={FadeIn} />
                            <Text style={[styles.recordingTimer, { color: colors.textPrimary }]}>{formatTime(recordingTime)}</Text>
                            
                            {!isLocked ? (
                                <Animated.View style={[styles.cancelContainer, cancelIndicatorStyle]}>
                                    <ChevronLeft size={16} color={colors.textMuted} />
                                    <Text style={[styles.cancelText, { color: colors.textMuted }]}>Slide to cancel</Text>
                                </Animated.View>
                            ) : (
                                <Pressable onPress={cancelRecording} style={styles.lockInfo}>
                                    <Trash2 size={20} color={colors.crimson} />
                                    <Text style={[styles.cancelText, { color: colors.crimson }]}>Discard</Text>
                                </Pressable>
                            )}
                            
                            <View style={styles.flexFill} />
                            
                            {!isLocked && (
                                <Animated.View style={[styles.lockContainer, lockIndicatorStyle]}>
                                    <Lock size={16} color={colors.textMuted} />
                                    <Text style={styles.lockText}>Slide up to lock</Text>
                                </Animated.View>
                            )}

                            {isLocked && (
                                <Pressable onPress={stopAndSend} style={[styles.sendLockedBtn, { backgroundColor: colors.sapphire }]}>
                                    <Send size={18} color="#FFF" />
                                </Pressable>
                            )}
                        </View>
                    ) : (
                        <View style={[styles.inputInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="Type a message..."
                                placeholderTextColor={colors.textMuted}
                                value={input}
                                onChangeText={setInput}
                                multiline
                                maxLength={500}
                                scrollEnabled={false}
                            />
                            
                            {isLoading ? (
                                <View style={styles.actionBtn}>
                                    <ActivityIndicator size="small" color={colors.gold} />
                                </View>
                            ) : input.trim() ? (
                                <Pressable onPress={() => handleSend()} style={[styles.actionBtn, { backgroundColor: colors.sapphire }]}>
                                    <Send size={18} color="#FFF" style={{ marginLeft: 2 }} />
                                </Pressable>
                            ) : (
                                <PanGestureHandler
                                    onGestureEvent={onGestureEvent}
                                    onHandlerStateChange={onHandlerStateChange}
                                >
                                    <Animated.View style={[
                                        styles.micActionBtn, 
                                        animatedMicStyle,
                                        { backgroundColor: isRecording ? colors.crimson : 'transparent' }
                                    ]}>
                                        <Pressable 
                                            onPressIn={startRecording}
                                            style={styles.micPressable}
                                        >
                                            <Mic size={22} color={isRecording ? "#FFF" : colors.gold} />
                                        </Pressable>
                                    </Animated.View>
                                </PanGestureHandler>
                            )}
                        </View>
                    )}
                </SafeBlurView>
            </KeyboardAvoidingView>
        </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, zIndex: 100 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    onlineStatus: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
    personaScrollContainer: { paddingVertical: 12, zIndex: 50 },
    personaList: { paddingHorizontal: 20, gap: 12 },
    personaCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, gap: 8, minWidth: 100 },
    personaNameLabel: { fontSize: 14, fontWeight: '700' },
    chatContent: { padding: 20, gap: 20 },
    msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    msgWrapperUser: { justifyContent: 'flex-end' },
    msgWrapperAi: { justifyContent: 'flex-start' },
    aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 2 },
    msgBubble: { maxWidth: '80%', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24 },
    msgBubbleUser: { borderBottomRightRadius: 4 },
    msgBubbleAi: { borderBottomLeftRadius: 4 },
    msgText: { fontSize: 16, lineHeight: 24 },
    msgTextUser: { color: '#FFFFFF', fontWeight: '500' },
    typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 42, marginTop: -10 },
    typingText: { fontSize: 13, fontStyle: 'italic' },
    keyboardAvoid: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
    
    // Updated Instagram-style input
    inputContainer: { 
        paddingTop: 12, 
        paddingHorizontal: 16, 
        borderTopWidth: 1,
    },
    inputInner: { 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        borderRadius: 24, 
        borderWidth: 1, 
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 48,
    },
    input: { 
        flex: 1, 
        fontSize: 16, 
        fontFamily: 'DMSans_400Regular',
        maxHeight: 120,
        paddingTop: 8,
        paddingBottom: 8,
        marginRight: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    micActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    
    audioToggle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
    playText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    
    // Recording Styles
    recordingRow: { flexDirection: 'row', alignItems: 'center', height: 48, gap: 12 },
    recordingIndicator: { width: 8, height: 8, borderRadius: 4 },
    recordingTimer: { fontSize: 16, fontWeight: '600', minWidth: 45, fontFamily: 'DMSans_600SemiBold' },
    flexFill: { flex: 1 },
    
    cancelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', right: 60 },
    cancelText: { fontSize: 14, fontWeight: '500' },
    
    lockContainer: { alignItems: 'center', position: 'absolute', right: 0, top: -70 },
    lockText: { fontSize: 10, fontWeight: '700', color: colors.gold, marginTop: 4, textTransform: 'uppercase' },
    
    lockInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sendLockedBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TextInput, 
    Pressable, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator,
    Dimensions,
    Alert,
    NativeModules
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
    ChevronLeft, 
    Mic, 
    Send, 
    MoreVertical, 
    Circle, 
    Play, 
    Square, 
    Trash2, 
    Lock,
    LockKeyhole,
    ChevronUp,
    ChevronRight,
    Volume2
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { SafeBlurView } from '../../components/ui/SafeBlurView';
import { PERSONAS, Persona } from '../../constants/personas';
import Animated, { 
    FadeIn, 
    FadeInUp, 
    FadeOut, 
    SlideInRight, 
    SlideInLeft,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import AudioService from '../../services/audio_service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Haptic wrapper
const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
        const styleEnum = style === 'light' ? Haptics.ImpactFeedbackStyle.Light : 
                          style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                          Haptics.ImpactFeedbackStyle.Heavy;
        await Haptics.impactAsync(styleEnum);
    } catch (e) {
        // Fallback
    }
};

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    audioUri?: string;
    isVoice?: boolean;
}

export default function ChatScreen() {
    const { persona: personaId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const persona = personaId as string || 'vinr';
    
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: '1', 
            text: `Hey! I'm ${PERSONAS.find((p: Persona) => p.id === persona)?.name}. How can I help you today?`, 
            sender: 'ai', 
            timestamp: new Date() 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Animation Values
    const micScale = useSharedValue(1);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const lockProgress = useSharedValue(0); // 0 to 1
    const cancelProgress = useSharedValue(0); // 0 to 1

    useEffect(() => {
        if (isLoading) {
            micScale.value = withRepeat(
                withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
                -1
            );
        } else {
            micScale.value = withSpring(1);
        }
    }, [isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Recording Logic
    const startRecording = async () => {
        const hasPermission = await AudioService.requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Please enable microphone access to record voice messages.');
            return;
        }

        const started = await AudioService.startRecording();
        if (started) {
            setIsRecording(true);
            setRecordingTime(0);
            setIsLocked(false);
            dragX.value = 0;
            dragY.value = 0;
            cancelProgress.value = 0;
            lockProgress.value = 0;
            triggerHaptic('medium');
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopAndSend = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const uri = await AudioService.stopRecording();
        setIsRecording(false);
        setIsLocked(false);
        setRecordingTime(0);
        
        if (uri) {
            triggerHaptic('heavy');
            processVoiceMessage(uri);
        }
    };

    const cancelRecording = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        await AudioService.stopRecording(); // Discard
        setIsRecording(false);
        setIsLocked(false);
        setRecordingTime(0);
        triggerHaptic('light');
    };

    const processVoiceMessage = async (uri: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            text: 'Voice message',
            sender: 'user',
            timestamp: new Date(),
            audioUri: uri,
            isVoice: true
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Transcription simulation (Replace with actual API)
            const transcribedText = await AudioService.transcribeAudio(uri);
            if (transcribedText) {
                // Handle as normal text send logic
                handleSend(transcribedText);
            }
        } catch (error) {
            console.error('Processing voice message failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input.trim();
        if (!textToSend) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date(),
        };

        if (!textOverride) {
            setMessages(prev => [...prev, userMsg]);
            setInput('');
        }
        
        setIsLoading(true);
        triggerHaptic('light');

        try {
            // Simulate AI response
            setTimeout(() => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `Response to: ${textToSend}`,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);
                triggerHaptic('medium');
            }, 1500);
        } catch (error) {
            setIsLoading(false);
        }
    };

    // Gesture Handlers
    const onGestureEvent = (event: any) => {
        if (!isRecording || isLocked) return;
        
        const { translationX, translationY } = event.nativeEvent;
        dragX.value = translationX;
        dragY.value = translationY;

        // Slide left to cancel
        if (translationX < -100) {
            cancelRecording();
        }
        
        // Slide up to lock
        if (translationY < -80) {
            setIsLocked(true);
            triggerHaptic('heavy');
            dragY.value = withSpring(0);
        }

        // Update progress visuals
        cancelProgress.value = Math.min(Math.abs(translationX) / 100, 1);
        lockProgress.value = Math.min(Math.abs(translationY) / 80, 1);
    };

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            if (isRecording && !isLocked) {
                if (dragX.value < -100) {
                    cancelRecording();
                } else {
                    stopAndSend();
                }
            }
        }
    };

    // Animated Styles
    const animatedMicStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: isRecording ? withSpring(1.5) : micScale.value },
            { translateX: isLocked ? 0 : dragX.value },
            { translateY: isLocked ? 0 : dragY.value }
        ]
    }));

    const lockIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(lockProgress.value, [0, 1], [0, -20]) }],
        opacity: interpolate(lockProgress.value, [0, 0.8], [1, 0.2])
    }));

    const cancelIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(cancelProgress.value, [0, 1], [0, -20]) }],
        opacity: interpolate(cancelProgress.value, [0, 0.8], [1, 0])
    }));

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        const pData = PERSONAS.find((p: Persona) => p.id === persona);

        return (
            <Animated.View 
                entering={isUser ? SlideInRight : SlideInLeft}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAi]}
            >
                {!isUser && (
                    <View style={[styles.aiAvatar, { borderColor: colors.gold, backgroundColor: colors.surface }]}>
                        {pData && <pData.icon size={20} color={isUser ? '#fff' : colors.gold} />}
                    </View>
                )}
                <View style={[
                    styles.msgBubble, 
                    isUser ? [styles.msgBubbleUser, { backgroundColor: colors.sapphire }] : [styles.msgBubbleAi, { backgroundColor: colors.surface }]
                ]}>
                    <Text style={[styles.msgText, isUser ? styles.msgTextUser : { color: colors.textPrimary }]}>
                        {item.text}
                    </Text>
                    {item.isVoice && (
                        <Pressable 
                            style={styles.playBtn}
                            onPress={() => AudioService.playRecording(item.audioUri!)}
                        >
                            <Play size={14} color={isUser ? "#FFF" : colors.gold} fill={isUser ? "#FFF" : colors.gold} />
                            <Text style={[styles.playText, { color: isUser ? "#FFF" : colors.gold }]}>Play Voice</Text>
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.container, { backgroundColor: colors.void }]}>
                <SafeBlurView intensity={80} style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft color={colors.textPrimary} size={28} />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            {PERSONAS.find((p: Persona) => p.id === persona)?.name}
                        </Text>
                        <View style={styles.onlineStatus} />
                    </View>
                    <Pressable style={styles.backBtn}>
                        <MoreVertical color={colors.textPrimary} size={20} />
                    </Pressable>
                </SafeBlurView>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={[styles.chatContent, { paddingBottom: 20 }]}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListFooterComponent={isLoading ? (
                            <Animated.View entering={FadeInUp} style={styles.typingContainer}>
                                <ActivityIndicator size="small" color={colors.gold} />
                                <Text style={[styles.typingText, { color: colors.textMuted }]}>
                                    {PERSONAS.find((p: Persona) => p.id === persona)?.name} is thinking...
                                </Text>
                            </Animated.View>
                        ) : null}
                    />

                    <SafeBlurView intensity={100} style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12), borderTopColor: colors.border }]}>
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
    inputContainer: { paddingTop: 12, paddingHorizontal: 16, borderTopWidth: 1 },
    inputInner: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, minHeight: 48 },
    input: { flex: 1, fontSize: 16, maxHeight: 120, paddingTop: 8, paddingBottom: 8, marginRight: 8 },
    actionBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    micActionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    micPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    playText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    recordingRow: { flexDirection: 'row', alignItems: 'center', height: 48, gap: 12 },
    recordingIndicator: { width: 8, height: 8, borderRadius: 4 },
    recordingTimer: { fontSize: 16, fontWeight: '600', minWidth: 45 },
    flexFill: { flex: 1 },
    cancelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', right: 60 },
    cancelText: { fontSize: 14, fontWeight: '500' },
    lockContainer: { alignItems: 'center', position: 'absolute', right: 0, top: -70 },
    lockText: { fontSize: 10, fontWeight: '700', color: '#D4A853', marginTop: 4, textTransform: 'uppercase' },
    lockInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sendLockedBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

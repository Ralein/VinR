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
    ScrollView,
    Clipboard
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
    ChevronLeft, 
    Mic, 
    Send, 
    MoreVertical, 
    Play, 
    Trash2, 
    Lock,
    ChevronUp,
    Copy,
    Reply,
    Smile,
    X,
    Check,
    CheckCheck,
    Camera,
    Plus,
    Image as ImageIcon
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
    Extrapolate,
    ZoomIn,
    BounceIn,
    SlideInUp,
    FadeInDown
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
    isRead?: boolean;
    reactions?: string[];
}

interface MessageAction {
    messageId: string;
    type: 'edit' | 'delete' | 'copy' | 'reply';
}

const Waveform = ({ color }: { color: string }) => {
    return (
        <View style={styles.waveformContainer}>
            {[40, 70, 50, 90, 60, 85, 45, 75, 55, 80].map((h, i) => (
                <View 
                    key={i} 
                    style={[
                        styles.waveBar, 
                        { height: `${h}%`, backgroundColor: color, opacity: i % 2 === 0 ? 1 : 0.6 }
                    ]} 
                />
            ))}
        </View>
    );
};

export default function ChatScreen() {
    const { persona: personaId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [persona, setPersona] = useState<string>(personaId as string || 'vinr');
    
    useEffect(() => {
        if (personaId) setPersona(personaId as string);
    }, [personaId]);

    const changePersona = (id: string) => {
        if (id === persona) return;
        setPersona(id);
        triggerHaptic('medium');
        
        const pName = PERSONAS.find(p => p.id === id)?.name;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `Switched to ${pName}. How can I help you?`,
            sender: 'ai',
            timestamp: new Date(),
            isRead: true
        }]);
    };
    
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: '1', 
            text: `Hey! I'm ${PERSONAS.find((p: Persona) => p.id === persona)?.name}. How can I help you today?`, 
            sender: 'ai', 
            timestamp: new Date(),
            isRead: true
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showMessageActions, setShowMessageActions] = useState<string | null>(null);
    
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Animation Values
    const micScale = useSharedValue(1);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const lockProgress = useSharedValue(0);
    const cancelProgress = useSharedValue(0);

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

    const formatMessageTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
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
        await AudioService.stopRecording();
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
            isVoice: true,
            isRead: true
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const transcribedText = await AudioService.transcribeAudio(uri);
            if (transcribedText) {
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
            isRead: true
        };

        if (!textOverride) {
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setReplyingTo(null);
        }
        
        setIsLoading(true);
        triggerHaptic('light');

        try {
            setTimeout(() => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `Response to: ${textToSend}`,
                    sender: 'ai',
                    timestamp: new Date(),
                    isRead: true
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);
                triggerHaptic('medium');
            }, 1500);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleMessageAction = async (messageId: string, action: string) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        switch (action) {
            case 'copy':
                await Clipboard.setString(message.text);
                Alert.alert('Copied', 'Message copied to clipboard');
                triggerHaptic('light');
                break;
            case 'delete':
                setMessages(prev => prev.filter(m => m.id !== messageId));
                triggerHaptic('medium');
                break;
            case 'reply':
                setReplyingTo(message);
                triggerHaptic('light');
                break;
        }
        setShowMessageActions(null);
    };

    // Gesture Handlers
    const onGestureEvent = (event: any) => {
        if (!isRecording || isLocked) return;
        
        const { translationX, translationY } = event.nativeEvent;
        dragX.value = translationX;
        dragY.value = translationY;

        if (translationX < -100) {
            cancelRecording();
        }
        
        if (translationY < -80) {
            setIsLocked(true);
            triggerHaptic('heavy');
            dragY.value = withSpring(0);
        }

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
        const isSelected = selectedMessage === item.id;

        return (
            <Animated.View 
                entering={isUser ? SlideInRight.springify() : SlideInLeft.springify()}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAi]}
            >
                {!isUser && (
                    <View style={[
                        styles.aiAvatar, 
                        { 
                            borderColor: colors.gold, 
                            backgroundColor: isDark ? colors.surface : colors.void,
                            shadowColor: colors.gold,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 3
                        }
                    ]}>
                        {pData && <pData.icon size={18} color={colors.gold} strokeWidth={2.5} />}
                    </View>
                )}
                
                <Pressable 
                    onLongPress={() => {
                        setShowMessageActions(item.id);
                        triggerHaptic('medium');
                    }}
                    onPress={() => setShowMessageActions(null)}
                    style={[
                        styles.msgBubble, 
                        isUser 
                            ? [styles.msgBubbleUser, { backgroundColor: colors.sapphire }] 
                            : [styles.msgBubbleAi, { 
                                backgroundColor: colors.surface, 
                                borderColor: isDark ? 'rgba(184,131,42,0.2)' : 'rgba(184,131,42,0.15)',
                                borderWidth: 1
                            }],
                        isSelected && styles.msgBubbleSelected
                    ]}
                >
                    {replyingTo?.id === item.id && (
                        <View style={[styles.replyIndicator, { borderLeftColor: colors.gold }]} />
                    )}
                    
                    <Text style={[
                        styles.msgText, 
                        isUser ? styles.msgTextUser : { color: colors.textPrimary }
                    ]}>
                        {item.text}
                    </Text>

                    <Text style={[
                        styles.msgTimestamp,
                        isUser ? { color: 'rgba(255,255,255,0.6)' } : { color: colors.textMuted }
                    ]}>
                        {formatMessageTime(item.timestamp)}
                    </Text>

                    {item.isVoice && (
                        <View style={[
                            styles.playBtn, 
                            { 
                                borderTopColor: item.sender === 'user' ? 'rgba(255,255,255,0.2)' : colors.gold + '20',
                                backgroundColor: item.sender === 'user' ? 'rgba(255,255,255,0.1)' : colors.gold + '10',
                                borderRadius: 12,
                                padding: 8,
                                marginTop: 10
                            }
                        ]}>
                            <Pressable 
                                style={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: 16, 
                                    backgroundColor: item.sender === 'user' ? 'rgba(255,255,255,0.2)' : colors.gold,
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}
                                onPress={() => AudioService.playRecording(item.audioUri!)}
                            >
                                <Play color="#FFFFFF" size={16} fill="#FFFFFF" />
                            </Pressable>
                            
                            <Waveform color={item.sender === 'user' ? '#FFFFFF' : colors.gold} />
                            
                            <Text style={[
                                styles.playText,
                                { color: item.sender === 'user' ? '#FFFFFF' : colors.textPrimary }
                            ]}>
                                0:12
                            </Text>
                        </View>
                    )}

                    {isUser && item.isRead && (
                        <View style={styles.readReceipt}>
                            <CheckCheck size={12} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                </Pressable>

                {/* Message Action Menu */}
                {showMessageActions === item.id && (
                    <Animated.View 
                        entering={ZoomIn.springify()}
                        style={[
                            styles.actionMenu,
                            { backgroundColor: colors.surface, shadowColor: colors.textPrimary },
                            isUser ? styles.actionMenuRight : styles.actionMenuLeft
                        ]}
                    >
                        <Pressable 
                            style={[styles.actionMenuItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleMessageAction(item.id, 'copy')}
                        >
                            <Copy size={16} color={colors.gold} />
                            <Text style={[styles.actionMenuText, { color: colors.textPrimary }]}>Copy</Text>
                        </Pressable>
                        
                        {!isUser && (
                            <Pressable 
                                style={[styles.actionMenuItem, { borderBottomColor: colors.border }]}
                                onPress={() => handleMessageAction(item.id, 'reply')}
                            >
                                <Reply size={16} color={colors.gold} />
                                <Text style={[styles.actionMenuText, { color: colors.textPrimary }]}>Reply</Text>
                            </Pressable>
                        )}
                        
                        <Pressable 
                            style={[styles.actionMenuItem, { borderBottomColor: 'transparent' }]}
                            onPress={() => handleMessageAction(item.id, 'delete')}
                        >
                            <Trash2 size={16} color={colors.crimson} />
                            <Text style={[styles.actionMenuText, { color: colors.crimson }]}>Delete</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.container, { backgroundColor: colors.void }]}>
                {/* Header */}
                <SafeBlurView 
                    intensity={isDark ? 85 : 35} 
                    style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}
                >
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <ChevronLeft color={colors.textPrimary} size={28} />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerTextWrapper}>
                            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                                {PERSONAS.find((p: Persona) => p.id === persona)?.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald }} />
                                <Text style={[styles.onlineText, { color: colors.textMuted }]}>Online</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <MoreVertical color={colors.textPrimary} size={20} />
                    </Pressable>
                </SafeBlurView>

                {/* Persona Switcher */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={[
                        styles.personaContainer, 
                        { 
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(184,131,42,0.02)', 
                            borderColor: colors.border
                        }
                    ]}
                    contentContainerStyle={styles.personaScrollContent}
                >
                    {PERSONAS.map((p) => (
                        <Pressable 
                            key={p.id}
                            onPress={() => changePersona(p.id)}
                            style={[
                                styles.personaTab,
                                persona === p.id && { 
                                    backgroundColor: isDark ? 'rgba(184,131,42,0.2)' : 'rgba(184,131,42,0.12)',
                                    borderColor: colors.gold,
                                    borderWidth: 1.5,
                                }
                            ]}
                        >
                            <p.icon 
                                size={15} 
                                color={persona === p.id ? colors.gold : colors.textGhost} 
                                strokeWidth={persona === p.id ? 2.5 : 2}
                            />
                            <Text style={[
                                styles.personaTabText, 
                                { color: persona === p.id ? colors.textPrimary : colors.textGhost },
                                persona === p.id && { fontWeight: '700' }
                            ]}>
                                {p.name}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    {/* Messages List */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={[styles.chatContent, { paddingBottom: 20 }]}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListEmptyComponent={
                            <Animated.View entering={FadeInUp} style={styles.emptyState}>
                                <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(184,131,42,0.1)' : 'rgba(184,131,42,0.08)' }]}>
                                    <Smile size={32} color={colors.gold} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Start a conversation</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Say something to get started</Text>
                            </Animated.View>
                        }
                        ListFooterComponent={isLoading ? (
                            <Animated.View entering={FadeInUp} style={styles.typingContainer}>
                                <View style={[
                                    styles.aiAvatar, 
                                    { 
                                        borderColor: colors.gold, 
                                        backgroundColor: isDark ? colors.surface : colors.void
                                    }
                                ]}>
                                    {PERSONAS.find((p: Persona) => p.id === persona)?.icon && 
                                        React.createElement(PERSONAS.find((p: Persona) => p.id === persona)!.icon, 
                                        { size: 16, color: colors.gold, strokeWidth: 2.5 })}
                                </View>
                                <View style={styles.typingDots}>
                                    {[0, 1, 2].map((i) => (
                                        <Animated.View
                                            key={i}
                                            entering={FadeIn.delay(i * 200)}
                                            style={[styles.dot, { backgroundColor: colors.gold }]}
                                        />
                                    ))}
                                </View>
                            </Animated.View>
                        ) : null}
                    />

                    {/* Bottom Area */}
                    <SafeBlurView 
                        intensity={isDark ? 85 : 80} 
                        style={[
                            styles.inputContainer, 
                            { 
                                borderTopColor: colors.border,
                                paddingBottom: Math.max(insets.bottom, 12)
                            }
                        ]}
                    >
                        {replyingTo && (
                            <Animated.View 
                                entering={FadeInDown.springify()}
                                exiting={FadeOut}
                                style={[styles.replyPreview, { backgroundColor: colors.surface, borderLeftColor: colors.gold }]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.replyTitle, { color: colors.gold }]}>Replying to {replyingTo.sender === 'user' ? 'yourself' : 'VinR Buddy'}</Text>
                                    <Text style={[styles.replyText, { color: colors.textMuted }]} numberOfLines={1}>{replyingTo.text}</Text>
                                </View>
                                <Pressable onPress={() => setReplyingTo(null)}>
                                    <X size={16} color={colors.textMuted} />
                                </Pressable>
                            </Animated.View>
                        )}

                        <View style={styles.inputInner}>
                            {isRecording ? (
                                <View style={styles.recordingRow}>
                                    {/* Left Side Action: Always Trash/Delete when recording */}
                                    <Pressable 
                                        onPress={cancelRecording} 
                                        style={[
                                            styles.lockedActionBtn, 
                                            { backgroundColor: isLocked ? colors.crimson + '20' : 'transparent' }
                                        ]}
                                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                    >
                                        <Trash2 size={isLocked ? 22 : 20} color={colors.crimson} />
                                    </Pressable>

                                    <View style={styles.recordingIndicator}>
                                        <Animated.View style={[styles.recordingDot, { backgroundColor: colors.crimson }]} />
                                        <Text style={[styles.recordingTime, { color: colors.textPrimary }]}>{formatTime(recordingTime)}</Text>
                                    </View>

                                    <View style={styles.flexFill}>
                                        {!isLocked && (
                                            <Animated.View style={[styles.cancelContainer, cancelIndicatorStyle]}>
                                                <ChevronLeft size={14} color={colors.textMuted} />
                                                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Slide to cancel</Text>
                                            </Animated.View>
                                        )}
                                    </View>

                                    {/* Right Side Action: Send if locked, Lock indicator if not */}
                                    {isLocked ? (
                                        <Pressable 
                                            onPress={stopAndSend} 
                                            style={[styles.lockedActionBtn, { backgroundColor: colors.sapphire }]}
                                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                        >
                                            <Send size={22} color="#FFF" />
                                        </Pressable>
                                    ) : (
                                        <Animated.View style={[styles.lockContainer, lockIndicatorStyle]}>
                                            <Lock size={14} color={colors.gold} />
                                            <Text style={[styles.lockText, { color: colors.gold }]}>Slide up to lock</Text>
                                        </Animated.View>
                                    )}
                                </View>
                            ) : (
                                <>
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Message..."
                                        placeholderTextColor={colors.textMuted}
                                        value={input}
                                        onChangeText={setInput}
                                        multiline
                                        editable={!isLoading}
                                    />

                                    <View style={styles.rightIconsRow}>
                                        {input.trim() === '' ? (
                                            <PanGestureHandler
                                                onGestureEvent={onGestureEvent}
                                                onHandlerStateChange={onHandlerStateChange}
                                            >
                                                <Animated.View style={[styles.micActionBtn, animatedMicStyle]}>
                                                    <Pressable 
                                                        onPressIn={startRecording}
                                                        style={styles.micPressable}
                                                    >
                                                        <Mic size={22} color={colors.gold} />
                                                    </Pressable>
                                                </Animated.View>
                                            </PanGestureHandler>
                                        ) : (
                                            <Animated.View entering={ZoomIn.springify()}>
                                                <Pressable 
                                                    style={[styles.actionBtn, { backgroundColor: colors.sapphire, width: 40, height: 40, borderRadius: 20 }]}
                                                    onPress={() => handleSend()}
                                                    disabled={isLoading}
                                                >
                                                    <Send size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                                                </Pressable>
                                            </Animated.View>
                                        )}
                                    </View>
                                </>
                            )}
                        </View>
                    </SafeBlurView>
                </KeyboardAvoidingView>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, zIndex: 100 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    headerTextWrapper: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    onlineText: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
    
    // Persona Tabs
    personaContainer: { 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        maxHeight: 60
    },
    personaScrollContent: {
        gap: 10,
        paddingHorizontal: 4
    },
    personaTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        gap: 6,
        minWidth: 100
    },
    personaTabText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Chat Content
    chatContent: { padding: 20, gap: 16 },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },

    // Messages
    msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 8 },
    msgWrapperUser: { justifyContent: 'flex-end' },
    msgWrapperAi: { justifyContent: 'flex-start' },
    aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 2 },
    msgBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    msgBubbleUser: { borderBottomRightRadius: 4 },
    msgBubbleAi: { borderBottomLeftRadius: 4, borderWidth: 1 },
    msgBubbleSelected: { shadowOpacity: 0.3, shadowRadius: 6 },
    msgText: { fontSize: 16, lineHeight: 24 },
    msgTextUser: { color: '#FFFFFF', fontWeight: '500' },
    msgTimestamp: { fontSize: 10, marginTop: 4, opacity: 0.7 },
    replyIndicator: { width: 3, height: '100%', borderLeftWidth: 3, marginRight: 8, borderRadius: 1 },
    
    // Play Button
    playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
    playText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    
    // Read Receipt
    readReceipt: { marginTop: 4, alignItems: 'flex-end', opacity: 0.8 },
    waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 20, flex: 1, marginHorizontal: 8 },
    waveBar: { width: 2, borderRadius: 1 },

    // Action Menu
    actionMenu: { position: 'absolute', borderRadius: 12, overflow: 'hidden', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 1000 },
    actionMenuRight: { right: 0, bottom: 50 },
    actionMenuLeft: { left: 0, bottom: 50 },
    actionMenuItem: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1 },
    actionMenuText: { fontSize: 13, fontWeight: '600' },

    // Typing Indicator
    typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 8, marginTop: 8 },
    typingDots: { flexDirection: 'row', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3 },

    // Reply Preview
    replyPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1 },
    replyTitle: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
    replyText: { fontSize: 14, fontWeight: '500' },

    // Input
    inputContainer: { paddingTop: 12, paddingHorizontal: 12, borderTopWidth: 1 },
    inputInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 4, minHeight: 48 },
    input: { flex: 1, fontSize: 16, maxHeight: 120, paddingTop: 8, paddingBottom: 8, marginHorizontal: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    rightIconsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 },
    micActionBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    micPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

    // Recording
    recordingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 40 },
    recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
    recordingDot: { width: 8, height: 8, borderRadius: 4 },
    recordingTime: { fontSize: 15, fontWeight: '600' },
    flexFill: { flex: 1 },
    cancelContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center' },
    cancelText: { fontSize: 13, fontWeight: '500' },
    lockContainer: { alignItems: 'center', position: 'absolute', bottom: 45, right: 0, left: 0 },
    lockText: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    lockedActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
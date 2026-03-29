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
    Clipboard,
    Keyboard
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
    ChevronLeft,
    Mic,
    Send,
    MoreVertical,
    Play,
    Trash2,
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
    FadeInDown,
    runOnJS
} from 'react-native-reanimated';
// ── File-1 gesture API ──────────────────────────────────────────────────────
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import AudioService from '../../services/audio_service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Haptic wrapper
const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
        const styleEnum =
            style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
            style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
            Haptics.ImpactFeedbackStyle.Heavy;
        await Haptics.impactAsync(styleEnum);
    } catch (e) { /* fallback */ }
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

const Waveform = ({ color }: { color: string }) => (
    <View style={styles.waveformContainer}>
        {[8, 14, 10, 18, 12, 17, 9, 15, 11, 16].map((h, i) => (
            <View
                key={i}
                style={[
                    styles.waveBar,
                    { height: h, backgroundColor: color, opacity: i % 2 === 0 ? 1 : 0.6 }
                ]}
            />
        ))}
    </View>
);

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
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    // isLocked lives as BOTH a shared value (for gesture worklet) and React state (for render)
    const isLockedSV = useSharedValue(false);
    const [isLocked, setIsLocked] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    // ── Animation values ────────────────────────────────────────────────────
    const micScale = useSharedValue(1);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

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

    // ── Recording logic (from file 1) ───────────────────────────────────────
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
            isLockedSV.value = false;
            dragX.value = 0;
            dragY.value = 0;
            triggerHaptic('medium');
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopAndSend = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const uri = await AudioService.stopRecording();
        isLockedSV.value = false;
        dragX.value = 0;
        dragY.value = 0;
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
        isLockedSV.value = false;
        dragX.value = 0;
        dragY.value = 0;
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
            if (transcribedText) handleSend(transcribedText);
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

    // ── Gesture.Pan — reads shared values so worklet never sees stale state ──
    const panGesture = Gesture.Pan()
        .onBegin(() => {
            // onBegin runs on the JS thread already for Gesture API when no worklet,
            // but we call runOnJS explicitly for async functions
            runOnJS(startRecording)();
        })
        .onUpdate((e) => {
            // All reads use shared values — never stale React state
            if (isLockedSV.value) return;

            dragX.value = e.translationX;
            dragY.value = e.translationY;


            // Swipe left past threshold → cancel
            if (e.translationX < -100) {
                runOnJS(cancelRecording)();
            }

            // Swipe up past threshold → lock
            if (e.translationY < -80) {
                isLockedSV.value = true;
                runOnJS(setIsLocked)(true);
                runOnJS(triggerHaptic)('heavy');
                dragX.value = 0;
                dragY.value = 0;
            }
        })
        .onEnd(() => {
            // If locked, user must tap send/trash buttons manually — don't auto-send
            if (isLockedSV.value) return;
            if (dragX.value <= -100) {
                runOnJS(cancelRecording)();
            } else {
                runOnJS(stopAndSend)();
            }
        });

    // ── Animated styles ─────────────────────────────────────────────────────
    const animatedMicStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: micScale.value },
            // Use shared value so translateX/Y update without re-render
            { translateX: isLockedSV.value ? 0 : dragX.value },
            { translateY: isLockedSV.value ? 0 : dragY.value }
        ]
    }));



    // ── Render message (file 2 UI) ───────────────────────────────────────────
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
                                    width: 32, height: 32, borderRadius: 16,
                                    backgroundColor: item.sender === 'user' ? 'rgba(255,255,255,0.2)' : colors.gold,
                                    alignItems: 'center', justifyContent: 'center'
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

    // ── Recording row: file-1 layout (trash + send buttons) ─────────────────
    // ── Recording row ────────────────────────────────────────────────────────
    const renderRecordingRow = () => (
        <View style={styles.recordingRow}>
            {/* Cancel */}
            <Pressable
                onPress={cancelRecording}
                style={[styles.lockedActionBtn, { backgroundColor: isLocked ? colors.crimson + '20' : 'transparent' }]}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Trash2 size={isLocked ? 22 : 20} color={colors.crimson} />
            </Pressable>

            {/* Timer */}
            <View style={styles.recordingIndicatorRow}>
                <Animated.View style={[styles.recordingDot, { backgroundColor: colors.crimson }]} entering={BounceIn} />
                <Text style={[styles.recordingTimer, { color: colors.textPrimary }]}>
                    {formatTime(recordingTime)}
                </Text>
            </View>

            <View style={styles.flexFill} />

            {/* Send */}
            <Pressable
                onPress={stopAndSend}
                style={[styles.lockedActionBtn, { backgroundColor: isLocked ? colors.sapphire + '20' : 'transparent' }]}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Send size={isLocked ? 22 : 20} color={colors.sapphire} />
            </Pressable>
        </View>
    );

    // ── Root render ──────────────────────────────────────────────────────────
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* File-2 outer structure: View > SafeBlurView header > persona strip > KAV */}
            <View style={[styles.container, { backgroundColor: colors.void }]}>

                {/* Header (file 2) */}
                <SafeBlurView
                    intensity={isDark ? 85 : 35}
                    style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
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

                    <Pressable
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <MoreVertical color={colors.textPrimary} size={20} />
                    </Pressable>
                </SafeBlurView>

                {/* Persona Switcher (file 2) */}
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

                {/* KAV wraps only messages + input (file 2) */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'android' ? (keyboardOpen ? 'padding' : undefined) : 'padding'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={keyboardOpen ? -18 : 0}
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
                                <View style={[styles.emptyIcon, {
                                    backgroundColor: isDark ? 'rgba(184,131,42,0.1)' : 'rgba(184,131,42,0.08)'
                                }]}>
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
                                    { borderColor: colors.gold, backgroundColor: isDark ? colors.surface : colors.void }
                                ]}>
                                    {PERSONAS.find((p: Persona) => p.id === persona)?.icon &&
                                        React.createElement(
                                            PERSONAS.find((p: Persona) => p.id === persona)!.icon,
                                            { size: 16, color: colors.gold, strokeWidth: 2.5 }
                                        )}
                                </View>
                                <View style={styles.typingDots}>
                                    <Animated.View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                    <Animated.View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                    <Animated.View style={[styles.dot, { backgroundColor: colors.gold }]} />
                                </View>
                            </Animated.View>
                        ) : null}
                    />

                    {/* Bottom input area — plain View avoids Android BlurView rendering as opaque grey */}
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                borderTopColor: colors.border,
                                backgroundColor: isDark ? colors.surface : colors.void,
                                paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                            }
                        ]}
                    >
                        {/* Reply preview (file 2) */}
                        {replyingTo && (
                            <Animated.View
                                entering={FadeInDown.springify().damping(20)}
                                style={[
                                    styles.replyPreview,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        borderLeftColor: colors.gold
                                    }
                                ]}
                            >
                                <View style={styles.replyPreviewContent}>
                                    <Text style={[styles.replyLabel, { color: colors.gold }]}>
                                        Replying to {replyingTo.sender === 'user' ? 'You' : 'AI'}
                                    </Text>
                                    <Text style={[styles.replyText, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {replyingTo.text}
                                    </Text>
                                </View>
                                <Pressable hitSlop={10} onPress={() => setReplyingTo(null)}>
                                    <X size={16} color={colors.textMuted} />
                                </Pressable>
                            </Animated.View>
                        )}

                        <View style={[
                            styles.inputInner,
                            {
                                borderColor: colors.border,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                            }
                        ]}>
                            {/*
                             * CRITICAL: The GestureDetector + mic must stay mounted
                             * throughout recording so the pan gesture stays active.
                             * We show the recording overlay on top and hide the text input,
                             * rather than swapping the whole block.
                             */}

                            {/* Recording overlay — shown during recording */}
                            {isRecording && renderRecordingRow()}

                            {/* Text input row — hidden (not unmounted) during recording */}
                            {!isRecording && (
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary }]}
                                    placeholder="Message..."
                                    placeholderTextColor={colors.textMuted}
                                    value={input}
                                    onChangeText={setInput}
                                    multiline
                                    editable={!isLoading}
                                />
                            )}

                            {/* Right side: mic (always mounted when no text) or send button */}
                            <View style={styles.rightIconsRow}>
                                {/* Mic — stays mounted during recording so gesture stays alive */}
                                {(input.trim() === '' || isRecording) ? (
                                    <GestureDetector gesture={panGesture}>
                                        <Animated.View style={[
                                            styles.micActionBtn,
                                            animatedMicStyle,
                                            // During recording the mic moves with finger;
                                            // hide the icon itself but keep the hit area
                                            isRecording && { opacity: 0, position: 'absolute', right: 0 }
                                        ]}>
                                            <View style={styles.micPressable}>
                                                <Mic size={22} color={colors.gold} />
                                            </View>
                                        </Animated.View>
                                    </GestureDetector>
                                ) : (
                                    <Animated.View entering={ZoomIn.springify()}>
                                        <Pressable
                                            style={[styles.actionBtn, {
                                                backgroundColor: colors.sapphire,
                                                width: 40, height: 40, borderRadius: 20
                                            }]}
                                            onPress={() => handleSend()}
                                            disabled={isLoading}
                                        >
                                            <Send size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                                        </Pressable>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, zIndex: 100 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    headerTextWrapper: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    onlineText: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },

    // Persona Tabs
    personaContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, maxHeight: 60 },
    personaScrollContent: { gap: 10, paddingHorizontal: 4 },
    personaTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, gap: 6, minWidth: 100 },
    personaTabText: { fontSize: 13, fontWeight: '600' },

    // Chat content
    chatContent: { padding: 20, gap: 16 },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },

    // Messages
    msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    msgWrapperUser: { justifyContent: 'flex-end' },
    msgWrapperAi: { justifyContent: 'flex-start' },
    aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 2 },
    msgBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    msgBubbleUser: { borderBottomRightRadius: 4 },
    msgBubbleAi: { borderBottomLeftRadius: 4, borderWidth: 1 },
    msgBubbleSelected: { shadowOpacity: 0.3, shadowRadius: 6 },
    msgText: { fontSize: 16, lineHeight: 24, marginBottom: 4 },
    msgTextUser: { color: '#FFFFFF', fontWeight: '500' },
    msgTimestamp: { fontSize: 11, marginTop: 4 },
    replyIndicator: { width: 3, borderLeftWidth: 3, marginRight: 8, borderRadius: 1 },

    // Voice message
    playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
    playText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    readReceipt: { marginTop: 4, alignItems: 'flex-end', opacity: 0.8 },
    waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 24, flex: 1, marginHorizontal: 8 },
    waveBar: { width: 3, borderRadius: 2 },

    // Action menu
    actionMenu: { position: 'absolute', borderRadius: 12, overflow: 'hidden', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 1000 },
    actionMenuRight: { right: 0, bottom: 50 },
    actionMenuLeft: { left: 0, bottom: 50 },
    actionMenuItem: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1 },
    actionMenuText: { fontSize: 13, fontWeight: '600' },

    // Typing indicator
    typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 8, marginTop: 8 },
    typingDots: { flexDirection: 'row', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3 },

    // Reply preview
    replyPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 4, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1 },
    replyPreviewContent: { flex: 1 },
    replyLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
    replyText: { fontSize: 14, fontWeight: '500' },

    // Input area
    inputContainer: { paddingTop: 12, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth },
    inputInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 4, minHeight: 48 },
    input: { flex: 1, fontSize: 16, maxHeight: 120, paddingTop: 8, paddingBottom: 8, marginHorizontal: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    rightIconsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 },
    micActionBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    micPressable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

    // Recording row (file-1 layout)
    recordingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 40 },
    recordingIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
    recordingDot: { width: 8, height: 8, borderRadius: 4 },
    recordingTimer: { fontSize: 15, fontWeight: '600' },
    flexFill: { flex: 1 },
    lockedActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
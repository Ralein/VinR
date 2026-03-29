import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Send, Mic, Sparkles, Brain, User as UserIcon, Volume2, Info, Bot, Heart, Zap, ShieldCheck } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, Layout, useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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

    const micScale = useSharedValue(1);

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
        transform: [{ scale: micScale.value }]
    }));

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.unloadAsync();
            }
        };
    }, []);

    const playAudio = async (uri: string) => {
        try {
            if (audioRef.current) {
                await audioRef.current.unloadAsync();
            }
            const { sound } = await SafeAudio.Sound.createAsync({ uri });
            audioRef.current = sound;
            await (sound as any).playAsync();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userText = input.trim();
        setInput('');
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await api.post('/chat/message', { 
                text: userText,
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

            setMessages(prev => {
                const newMessages = [...prev, aiMsg];
                return newMessages.slice(-20);
            });

            if (aiMsg.audioUrl && audioEnabled) {
                playAudio(aiMsg.audioUrl);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const newMessages = [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: "Sorry, I'm having trouble connecting to my brain right now. Please try again."
                }];
                return newMessages.slice(-20);
            });
        } finally {
            setIsLoading(false);
        }
    };

    const changePersona = (newPersona: PersonaType) => {
        if (newPersona === persona) return;
        setPersona(newPersona);
        
        const pData = PERSONAS.find(p => p.id === newPersona);
        const welcomeText = `Switching to ${pData?.name}. ${pData?.bio.split(' ').slice(1).join(' ')} mode active.`;
            
        setMessages(prev => {
            const newMessages = [...prev, {
                id: `switch-${Date.now()}`,
                role: 'assistant' as const,
                content: welcomeText,
                persona: newPersona
            }];
            return newMessages.slice(-20);
        });
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
                style={[
                    styles.msgWrapper, 
                    isUser ? styles.msgWrapperUser : styles.msgWrapperAi
                ]}
            >
                {!isUser && (
                    <View style={[
                        styles.aiAvatar, 
                        { backgroundColor: `${pData?.color || colors.gold}15`, borderColor: `${pData?.color || colors.gold}30` }
                    ]}>
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
                    <Text style={[
                        styles.msgText, 
                        isUser ? styles.msgTextUser : { color: colors.textPrimary }
                    ]}>
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
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <SafeBlurView intensity={90} style={[
                styles.header, 
                { 
                    paddingTop: insets.top + 10,
                    borderBottomColor: colors.border
                }
            ]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.surface : colors.elevated }]}>
                    <ChevronLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>VinR Buddy</Text>
                    <View style={styles.onlineStatus} />
                </View>
                <Pressable 
                    onPress={() => setAudioEnabled(!audioEnabled)} 
                    style={[
                        styles.audioToggle, 
                        { 
                            backgroundColor: audioEnabled ? `${colors.gold}15` : (isDark ? colors.surface : colors.elevated), 
                            borderColor: audioEnabled ? colors.gold : colors.border,
                            borderWidth: 1.5 
                        }
                    ]}
                >
                    <Mic size={20} color={audioEnabled ? colors.gold : colors.textMuted} />
                </Pressable>
            </SafeBlurView>

            {/* Persona Selector */}
            <View style={styles.personaScrollContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.personaList}
                >
                    {PERSONAS.map((p) => {
                        const Icon = p.icon;
                        const isSelected = persona === p.id;
                        return (
                            <Pressable 
                                key={p.id}
                                onPress={() => changePersona(p.id)}
                                style={[
                                    styles.personaCard,
                                    { 
                                        backgroundColor: isSelected ? `${p.color}15` : (isDark ? colors.surface : colors.elevated),
                                        borderColor: isSelected ? p.color : 'transparent',
                                        borderWidth: 2
                                    }
                                ]}
                            >
                                <Icon size={20} color={isSelected ? p.color : colors.textMuted} />
                                <Text style={[
                                    styles.personaNameLabel, 
                                    { color: isSelected ? p.color : colors.textPrimary }
                                ]}>{p.name}</Text>
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
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={styles.keyboardAvoid}
            >
                <SafeBlurView intensity={100} style={[
                    styles.inputContainer, 
                    { 
                        paddingBottom: Math.max(insets.bottom, 20),
                        borderTopColor: colors.border
                    }
                ]}>
                    <View style={[styles.inputInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textMuted}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                        />
                        {isLoading ? (
                            <Animated.View style={[styles.sendBtn, animatedMicStyle]}>
                                <Mic size={20} color={colors.gold} />
                            </Animated.View>
                        ) : input.trim() ? (
                            <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.sapphire }]}>
                                <Send size={20} color="#FFF" style={{ marginLeft: 2 }} />
                            </Pressable>
                        ) : (
                            <Pressable 
                                onPress={() => setAudioEnabled(!audioEnabled)}
                                style={[styles.sendBtn, { backgroundColor: audioEnabled ? `${colors.gold}15` : 'transparent' }]}
                            >
                                <Mic size={24} color={audioEnabled ? colors.gold : colors.textMuted} />
                            </Pressable>
                        )}
                    </View>
                </SafeBlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        zIndex: 100,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    onlineStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    personaScrollContainer: {
        paddingVertical: 12,
        zIndex: 50,
    },
    personaList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    personaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 8,
        minWidth: 100,
    },
    personaNameLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    chatContent: {
        padding: 20,
        gap: 20,
    },
    msgWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    msgWrapperUser: {
        justifyContent: 'flex-end',
    },
    msgWrapperAi: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        marginBottom: 2,
    },
    msgBubble: {
        maxWidth: '80%',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 24,
    },
    msgBubbleUser: {
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    msgBubbleAi: {
        borderBottomLeftRadius: 4,
    },
    msgText: {
        fontSize: 16,
        lineHeight: 24,
    },
    msgTextUser: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 42,
        marginTop: -10,
    },
    typingText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    keyboardAvoid: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    inputInner: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 30,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderWidth: 1,
        minHeight: 56,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 120,
        paddingTop: 8,
        paddingBottom: 8,
        marginRight: 12,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1,
    },
    audioToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    playText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});

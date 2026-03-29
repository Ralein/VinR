import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Send, Mic, Sparkles, Brain, User as UserIcon, Volume2, Info } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';


const SafeBlurView = (props: any) => {
    const { isDark } = useTheme();
    try {
        if (BlurView) {
            return <BlurView {...props} tint={isDark ? "dark" : "light"} />;
        }
    } catch (e) {}
    return <View {...props} />;
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
    persona?: 'sara' | 'alex';
}

type PersonaType = 'sara' | 'alex';

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
                // Limit to 20 messages, removing the oldest ones from the top
                return newMessages.slice(-20);
            });

            if (aiMsg.audioUrl) {
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

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isUser = item.role === 'user';
        const msgPersona = item.persona || 'sara';
        
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
                        { backgroundColor: `${colors.gold}15` }
                    ]}>
                        {msgPersona === 'sara' ? (
                            <Sparkles size={16} color={colors.gold} />
                        ) : (
                            <Brain size={16} color={colors.gold} />
                        )}
                    </View>
                )}
                <View style={[
                    styles.msgBubble, 
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAi,
                    isUser ? { backgroundColor: colors.sapphire } : { 
                        backgroundColor: isDark ? colors.surface : colors.elevated, 
                        borderColor: colors.border 
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
                            style={[styles.playBtn, { borderTopColor: colors.border }]}
                        >
                            <Volume2 size={14} color={colors.gold} />
                            <Text style={[styles.playText, { color: colors.gold }]}>Listen</Text>
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        );
    };

    const changePersona = (newPersona: PersonaType) => {
        if (newPersona === persona) return;
        setPersona(newPersona);
        
        const welcomeText = newPersona === 'sara' 
            ? "Switching to Sara. She's kind, calm, and ready to listen."
            : "Switching to Alex. He's playful, nerdy, and ready to improve together!";
            
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

    return (
        <View style={[styles.container, { backgroundColor: colors.void }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={[
                styles.header, 
                { 
                    paddingTop: insets.top + 10,
                    backgroundColor: isDark ? 'rgba(7, 9, 15, 0.95)' : 'rgba(245, 242, 236, 0.95)',
                    borderBottomWidth: isDark ? 1 : 0,
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
                            backgroundColor: isDark ? colors.surface : colors.elevated, 
                            borderColor: audioEnabled ? colors.gold : colors.border,
                            borderWidth: 1.5 
                        },
                        !audioEnabled && styles.audioDisabled
                    ]}
                >
                    <Mic size={20} color={audioEnabled ? colors.gold : colors.textMuted} />
                </Pressable>
            </View>

            {/* Persona Selection */}
            <View style={[styles.personaContainer, { backgroundColor: isDark ? colors.surface : colors.elevated }]}>
                <Pressable 
                    onPress={() => changePersona('sara')}
                    style={[
                        styles.personaTab, 
                        persona === 'sara' && { 
                            backgroundColor: isDark ? `${colors.gold}15` : colors.void, 
                            borderColor: colors.gold,
                            shadowColor: colors.gold,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0 : 0.08,
                            shadowRadius: 4,
                            elevation: 2
                        }
                    ]}
                >
                    <Sparkles size={14} color={persona === 'sara' ? colors.gold : colors.textMuted} />
                    <View>
                        <Text style={[
                            styles.personaName, 
                            { color: persona === 'sara' ? colors.gold : colors.textPrimary }
                        ]}>Sara</Text>
                        <Text style={[styles.personaSub, { color: colors.textMuted }]}>Kind & Calm</Text>
                    </View>
                </Pressable>
                <Pressable 
                    onPress={() => changePersona('alex')}
                    style={[
                        styles.personaTab, 
                        persona === 'alex' && { 
                            backgroundColor: isDark ? `${colors.gold}15` : colors.void, 
                            borderColor: colors.gold,
                            shadowColor: colors.gold,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isDark ? 0 : 0.08,
                            shadowRadius: 4,
                            elevation: 2
                        }
                    ]}
                >
                    <Brain size={14} color={persona === 'alex' ? colors.gold : colors.textMuted} />
                    <View>
                        <Text style={[
                            styles.personaName, 
                            { color: persona === 'alex' ? colors.gold : colors.textPrimary }
                        ]}>Alex</Text>
                        <Text style={[styles.personaSub, { color: colors.textMuted }]}>Nerd & Playful</Text>
                    </View>
                </Pressable>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={[styles.chatContent, { paddingBottom: insets.bottom + 100 }]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={styles.keyboardAvoid}
            >
                <SafeBlurView intensity={80} style={[
                    styles.inputContainer, 
                    { 
                        paddingBottom: insets.bottom || 20,
                        borderTopColor: colors.border
                    }
                ]}>
                    <View style={[styles.inputInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Message VinR..."
                            placeholderTextColor={colors.textMuted}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                            onSubmitEditing={handleSend}
                        />
                        {isLoading ? (
                            <View style={styles.sendBtn}>
                                <ActivityIndicator size="small" color={colors.gold} />
                            </View>
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
        zIndex: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        fontWeight: '700',
    },
    onlineStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginTop: 2,
    },
    personaContainer: {
        flexDirection: 'row',
        padding: 8,
        margin: 16,
        borderRadius: 12,
        gap: 8,
    },
    personaTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    personaText: {
        fontSize: 13,
        fontWeight: '600',
    },
    chatContent: {
        padding: 20,
        gap: 16,
    },
    msgWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginVertical: 4,
    },
    msgWrapperUser: {
        justifyContent: 'flex-end',
    },
    msgWrapperAi: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212,168,83,0.3)',
        marginBottom: 4,
    },
    msgBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    msgBubbleUser: {
        borderBottomRightRadius: 4,
    },
    msgBubbleAi: {
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    msgText: {
        fontSize: 16,
        lineHeight: 24,
    },
    msgTextUser: {
        color: '#FFFFFF',
    },
    keyboardAvoid: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    inputInner: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        minHeight: 52,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    audioToggle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    audioDisabled: {
        opacity: 0.5,
    },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    playText: {
        fontSize: 12,
        fontWeight: '600',
    },
    personaName: {
        fontSize: 14,
        fontWeight: '700',
    },
    personaSub: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: -2,
    }
});

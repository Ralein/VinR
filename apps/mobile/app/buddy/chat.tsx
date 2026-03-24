import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Send, Mic, Sparkles } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../../services/api';

const THEME = {
    bg: '#0F172A',
    surface: '#1E293B',
    primary: '#6366F1',
    gold: '#FBBF24',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155'
};

import { Audio } from 'expo-av';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm VinR, your personal growth companion. How are you feeling today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const audioRef = useRef<Audio.Sound | null>(null);

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
            const { sound } = await Audio.Sound.createAsync({ uri });
            audioRef.current = sound;
            await sound.playAsync();
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
                voice_enabled: audioEnabled 
            });

            const aiMsg: Message = {
                id: res.data.buddy_message.id || Date.now().toString(),
                role: 'assistant',
                content: res.data.buddy_message.content,
                audioUrl: res.data.buddy_message.audio_url
            };

            setMessages(prev => [...prev, aiMsg]);

            if (aiMsg.audioUrl) {
                playAudio(aiMsg.audioUrl);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to my brain right now. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isUser = item.role === 'user';
        return (
            <Animated.View 
                entering={FadeInDown.delay(index * 100).duration(400)}
                style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAi]}
            >
                {!isUser && (
                    <View style={styles.aiAvatar}>
                        <Sparkles size={16} color={THEME.gold} />
                    </View>
                )}
                <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAi]}>
                    <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                        {item.content}
                    </Text>
                    {!isUser && item.audioUrl && (
                        <Pressable onPress={() => playAudio(item.audioUrl!)} style={styles.playBtn}>
                            <Mic size={14} color={THEME.gold} />
                            <Text style={styles.playText}>Listen</Text>
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={THEME.text} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>VinR Buddy</Text>
                    <View style={styles.onlineStatus} />
                </View>
                <Pressable 
                    onPress={() => setAudioEnabled(!audioEnabled)} 
                    style={[styles.audioToggle, !audioEnabled && styles.audioDisabled]}
                >
                    <Mic size={20} color={audioEnabled ? THEME.gold : THEME.textMuted} />
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
                <BlurView intensity={80} tint="dark" style={[styles.inputContainer, { paddingBottom: insets.bottom || 20 }]}>
                    <View style={styles.inputInner}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message VinR..."
                            placeholderTextColor={THEME.textMuted}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                            onSubmitEditing={handleSend}
                        />
                        {isLoading ? (
                            <View style={styles.sendBtn}>
                                <ActivityIndicator size="small" color={THEME.gold} />
                            </View>
                        ) : input.trim() ? (
                            <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: THEME.primary }]}>
                                <Send size={20} color="#FFF" style={{ marginLeft: 2 }} />
                            </Pressable>
                        ) : (
                            <Pressable 
                                onPress={() => setAudioEnabled(!audioEnabled)}
                                style={[styles.sendBtn, { backgroundColor: audioEnabled ? `${THEME.gold}20` : 'transparent' }]}
                            >
                                <Mic size={24} color={audioEnabled ? THEME.gold : THEME.textMuted} />
                            </Pressable>
                        )}
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.surface,
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
        color: THEME.text,
        fontSize: 18,
        fontWeight: '600',
    },
    onlineStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginTop: 2,
    },
    chatContent: {
        padding: 20,
        gap: 16,
    },
    msgWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
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
        backgroundColor: `${THEME.gold}20`,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: `${THEME.gold}40`,
        marginBottom: 4,
    },
    msgBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    msgBubbleUser: {
        backgroundColor: THEME.primary,
        borderBottomRightRadius: 4,
    },
    msgBubbleAi: {
        backgroundColor: THEME.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    msgText: {
        fontSize: 16,
        lineHeight: 24,
    },
    msgTextUser: {
        color: '#FFFFFF',
    },
    msgTextAi: {
        color: THEME.text,
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
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    inputInner: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: THEME.surface,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: THEME.border,
        minHeight: 52,
    },
    input: {
        flex: 1,
        color: THEME.text,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
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
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    playText: {
        color: THEME.gold,
        fontSize: 12,
        fontWeight: '600',
    }
});

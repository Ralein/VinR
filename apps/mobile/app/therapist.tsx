import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Filter, Calendar, MessageSquare, ChevronRight, Brain, Heart, Wind, Sparkles } from 'lucide-react-native';
import { fonts, colors, spacing, borderRadius } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import GoldButton from '../components/ui/GoldButton';

const INITIAL_MESSAGES = [
    { id: '1', role: 'ai', text: 'Hello Ralein. I am here to listen. How are you feeling today?' },
];

export default function TherapistScreen() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            const aiMsg = { 
                id: (Date.now() + 1).toString(), 
                role: 'ai', 
                text: "I understand. Let's explore that feeling further. What do you think triggered it?" 
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.void }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Therapists</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find the right support for your journey</Text>
            </View>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
                keyboardVerticalOffset={100}
            >
                <ScrollView 
                    style={styles.chatArea}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(msg => (
                        <View 
                            key={msg.id} 
                            style={[
                                styles.messageBubble, 
                                msg.role === 'user' ? styles.userBubble : styles.aiBubble
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                msg.role === 'user' ? styles.userText : styles.aiText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={colors.textMuted}
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <Pressable style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    header: {
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: colors.void,
    },
    title: {
        fontSize: 32,
        fontFamily: fonts.display,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.textSecondary,
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.gold,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: colors.elevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: colors.void,
    },
    aiText: {
        color: colors.textPrimary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.lg,
        gap: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        maxHeight: 120,
        color: colors.textPrimary,
        fontFamily: fonts.body,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sendButton: {
        backgroundColor: colors.gold,
        height: 44,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        fontFamily: fonts.bodySemiBold,
        color: colors.void,
    },
});

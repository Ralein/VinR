import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    Pressable, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import Animated, { FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';
import { ArrowUp } from 'lucide-react-native';
import { Layout } from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fonts, borderRadius } from '../../constants/theme';

const INITIAL_MESSAGES = [
    { id: '1', text: "Hello! I'm your VinR Buddy. How are you feeling today?", sender: 'ai' }
];

const BuddyChat = () => {
    const { colors } = useTheme();
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newUserMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user'
        };

        setMessages([...messages, newUserMessage]);
        setInputText('');

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                text: "I hear you. Let's take a moment together. Would you like to try a quick breathing exercise?",
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <Layout title="Your Buddy" screenPadding={false}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((msg, index) => (
                        <Animated.View 
                            key={msg.id}
                            entering={FadeInUp.delay(index * 50).duration(400)}
                            layout={LinearTransition}
                            style={[
                                styles.messageBubble,
                                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                                { 
                                    backgroundColor: msg.sender === 'user' ? colors.gold + '15' : colors.surface,
                                    borderColor: msg.sender === 'user' ? colors.gold + '40' : colors.border 
                                }
                            ]}
                        >
                            <Text style={[
                                styles.messageText, 
                                { color: msg.sender === 'user' ? colors.gold : colors.textPrimary }
                            ]}>
                                {msg.text}
                            </Text>
                        </Animated.View>
                    ))}
                </ScrollView>

                <View style={[styles.inputWrapper, { backgroundColor: colors.void, borderTopColor: colors.border }]}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TextInput 
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <Pressable 
                            style={[styles.sendButton, { backgroundColor: inputText ? colors.gold : colors.textMuted + '40' }]}
                            onPress={handleSend}
                            disabled={!inputText}
                        >
                            <ArrowUp size={20} color={colors.void} strokeWidth={3} />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    messageBubble: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        maxWidth: '85%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: borderRadius.xs,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: borderRadius.xs,
    },
    messageText: {
        fontFamily: fonts.body,
        fontSize: 16,
        lineHeight: 22,
    },
    inputWrapper: {
        padding: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.pill,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: spacing.sm,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
});

export default BuddyChat;

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Calendar, Filter, MoreVertical, BookOpen } from 'lucide-react-native';
import { Layout } from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface JournalEntry {
    id: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'growth';
}

const MOCK_ENTRIES: JournalEntry[] = [
    {
        id: '1',
        title: 'Morning Reflections',
        date: 'Today, 8:30 AM',
        excerpt: 'Woke up feeling refreshed. The light in the room was particularly soft this morning...',
        tags: ['Grateful', 'Morning'],
        sentiment: 'positive',
    },
    {
        id: '2',
        title: 'Work Sprint & Focus',
        date: 'Yesterday, 4:15 PM',
        excerpt: 'Managed to complete the core architecture for the new project. Feeling accomplished but tired.',
        tags: ['Work', 'Focus'],
        sentiment: 'growth',
    },
    {
        id: '3',
        title: 'Late Night Thoughts',
        date: 'Oct 24, 2023',
        excerpt: 'Contemplating the balance between ambition and peace. It’s a delicate line to walk.',
        tags: ['Philosophy', 'Rest'],
        sentiment: 'neutral',
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function JournalScreen() {
    const router = useRouter();
    const { colors, gradients, glass, isDark, typography, spacing, borderRadius } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEntries = useMemo(() => {
        return MOCK_ENTRIES.filter(entry =>
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const getSentimentColor = (sentiment: JournalEntry['sentiment']) => {
        switch (sentiment) {
            case 'positive': return colors.emerald;
            case 'growth': return colors.gold;
            case 'negative': return colors.crimson;
            default: return colors.sapphire;
        }
    };

    return (
        <Layout title="Your Journal" showBack={false}>
            <View style={styles.container}>
                {/* ── Search Bar ── */}
                <View style={[styles.searchContainer, { marginBottom: spacing.lg }]}>
                    <View style={[styles.searchWrapper, { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderRadius: borderRadius.lg 
                    }]}>
                        <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search your entries..."
                            placeholderTextColor={colors.textGhost}
                            style={[styles.searchInput, { color: colors.textPrimary, fontFamily: typography.body.fontFamily }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.filterButton}>
                            <Filter size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Entries Scroll ── */}
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                >
                    {filteredEntries.map((entry, index) => (
                        <TouchableOpacity 
                            key={entry.id}
                            style={[styles.entryCard, { 
                                backgroundColor: isDark ? colors.elevated : '#FFFFFF',
                                borderRadius: borderRadius.xl,
                                borderLeftWidth: 4,
                                borderLeftColor: getSentimentColor(entry.sentiment)
                            }]}
                            onPress={() => {}}
                        >
                            <View style={styles.entryHeader}>
                                <Text style={[typography.h3, { flex: 1 }]}>{entry.title}</Text>
                                <MoreVertical size={18} color={colors.textGhost} />
                            </View>
                            
                            <View style={styles.dateContainer}>
                                <Calendar size={12} color={colors.textMuted} />
                                <Text style={[typography.caption, { marginLeft: 4 }]}>{entry.date}</Text>
                            </View>

                            <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: spacing.sm }]} numberOfLines={2}>
                                {entry.excerpt}
                            </Text>

                            <View style={[styles.tagRow, { marginTop: spacing.md }]}>
                                {entry.tags.map(tag => (
                                    <View key={tag} style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                                        <Text style={[typography.caption, { color: colors.gold }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {filteredEntries.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <BookOpen size={48} color={colors.textGhost} />
                            <Text style={[typography.h3, { color: colors.textMuted, marginTop: spacing.md }]}>No entries found</Text>
                            <Text style={[typography.bodySm, { color: colors.textGhost, textAlign: 'center', marginTop: spacing.xs }]}>
                                Try searching for something else or write your first entry.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* ── Floating Action Button ── */}
                <TouchableOpacity 
                    style={styles.fab}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={gradients.goldShimmer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.fabGradient}
                    >
                        <Plus size={28} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </Layout>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 5,
    },
    searchContainer: {
        marginTop: 10,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        padding: 8,
    },
    entryCard: {
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowColor: '#D4A853',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/**
 * Profile Settings — View profile info + Delete account
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Alert, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, User, Mail, Calendar, Target, Leaf,
    Trash2, AlertTriangle, X,
} from 'lucide-react-native';
import { colors, fonts, spacing, borderRadius } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { deleteItemAsync } from '../utils/storage';

export default function ProfileSettingsScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account, all check-ins, journal entries, streaks, and data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: () => {
                        setDeleteConfirmText('');
                        setShowDeleteModal(true);
                    },
                },
            ]
        );
    };

    const executeDelete = async () => {
        if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
            Alert.alert('Cancelled', 'You did not type DELETE. Account was not deleted.');
            return;
        }
        try {
            setShowDeleteModal(false);
            setIsDeleting(true);
            await api.delete('/auth/me');
            await deleteItemAsync('authToken');
            signOut();
            router.replace('/');
        } catch (err) {
            setIsDeleting(false);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
    };

    const memberSince = user?.onboardingComplete
        ? 'Onboarding complete'
        : 'Not yet onboarded';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.title}>My Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            {isDeleting ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.crimson} />
                    <Text style={styles.loadingText}>Deleting account...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Avatar & Name */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <User size={36} color={colors.gold} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.userName}>{user?.name || 'VinR User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'No email set'}</Text>
                    </View>

                    {/* Profile Info Card */}
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.card}>
                        <ProfileRow
                            Icon={User}
                            label="Name"
                            value={user?.name || '—'}
                            iconColor={colors.gold}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            Icon={Mail}
                            label="Email"
                            value={user?.email || '—'}
                            iconColor={colors.sapphire}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            Icon={Calendar}
                            label="Age Range"
                            value={user?.age || '—'}
                            iconColor={colors.emerald}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            Icon={Target}
                            label="Primary Reason"
                            value={user?.primaryReason || '—'}
                            iconColor={colors.lavender}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            Icon={Leaf}
                            label="Relaxation Methods"
                            value={user?.relaxationMethods?.join(', ') || '—'}
                            iconColor={colors.emerald}
                        />
                        <View style={styles.divider} />
                        <ProfileRow
                            Icon={Calendar}
                            label="Status"
                            value={memberSince}
                            iconColor={colors.textMuted}
                        />
                    </View>

                    {/* Timezone */}
                    <Text style={styles.sectionTitle}>Timezone</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.rowValue}>{user?.timezone || 'UTC'}</Text>
                        </View>
                    </View>

                    {/* Danger Zone */}
                    <Text style={[styles.sectionTitle, { color: colors.crimson }]}>Danger Zone</Text>
                    <View style={[styles.card, styles.dangerCard]}>
                        <View style={styles.dangerInfo}>
                            <AlertTriangle size={20} color={colors.crimson} strokeWidth={2} />
                            <Text style={styles.dangerText}>
                                Deleting your account is permanent. All data including check-ins,
                                journal entries, streaks, and preferences will be erased.
                            </Text>
                        </View>
                        <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
                            <Trash2 size={18} color="#fff" />
                            <Text style={styles.deleteButtonText}>Delete My Account</Text>
                        </Pressable>
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            )}

            {/* Cross-platform DELETE confirmation modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AlertTriangle size={24} color={colors.crimson} />
                            <Text style={styles.modalTitle}>Confirm Deletion</Text>
                            <Pressable onPress={() => setShowDeleteModal(false)} style={styles.modalClose}>
                                <X size={20} color={colors.textMuted} />
                            </Pressable>
                        </View>
                        <Text style={styles.modalDesc}>
                            Type <Text style={{ fontFamily: fonts.bodySemiBold, color: colors.crimson }}>DELETE</Text> to permanently delete your account.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Type DELETE"
                            placeholderTextColor={colors.textGhost}
                            value={deleteConfirmText}
                            onChangeText={setDeleteConfirmText}
                            autoCapitalize="characters"
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.modalCancelBtn}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalDeleteBtn,
                                    deleteConfirmText.trim().toUpperCase() !== 'DELETE' && { opacity: 0.4 },
                                ]}
                                onPress={executeDelete}
                                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                            >
                                <Trash2 size={16} color="#fff" />
                                <Text style={styles.modalDeleteText}>Delete Forever</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ── Reusable Profile Row ────────────────────────────────────

function ProfileRow({
    Icon, label, value, iconColor,
}: {
    Icon: any; label: string; value: string; iconColor: string;
}) {
    return (
        <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${iconColor}15` }]}>
                <Icon size={18} color={iconColor} strokeWidth={1.8} />
            </View>
            <View style={styles.rowTextContainer}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
            </View>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 20,
        color: colors.textPrimary,
    },
    loadingContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md,
    },
    loadingText: {
        fontFamily: fonts.body, fontSize: 16,
        color: colors.crimson,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatarCircle: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: `${colors.gold}10`,
        borderWidth: 2, borderColor: colors.gold,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.md,
    },
    userName: {
        fontFamily: fonts.display, fontSize: 24,
        color: colors.textPrimary, marginBottom: 4,
    },
    userEmail: {
        fontFamily: fonts.body, fontSize: 14,
        color: colors.textMuted,
    },
    sectionTitle: {
        fontFamily: fonts.bodySemiBold, fontSize: 14,
        color: colors.textMuted, textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: spacing.md,
        marginTop: spacing.xl, paddingHorizontal: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1, borderColor: colors.border,
        overflow: 'hidden',
    },
    dangerCard: {
        borderColor: `${colors.crimson}30`,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    rowIcon: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowLabel: {
        fontFamily: fonts.bodySemiBold, fontSize: 12,
        color: colors.textMuted, marginBottom: 2,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    rowValue: {
        fontFamily: fonts.body, fontSize: 16,
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 60,
    },
    dangerInfo: {
        flexDirection: 'row', alignItems: 'flex-start',
        padding: spacing.md, gap: spacing.sm,
    },
    dangerText: {
        fontFamily: fonts.body, fontSize: 13,
        color: colors.textMuted, flex: 1, lineHeight: 18,
    },
    deleteButton: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.crimson,
        margin: spacing.md, marginTop: 0,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    deleteButtonText: {
        fontFamily: fonts.bodySemiBold, fontSize: 16,
        color: '#ffffff',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: `${colors.crimson}30`,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontFamily: fonts.display,
        fontSize: 18,
        color: colors.textPrimary,
        flex: 1,
    },
    modalClose: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    modalDesc: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    modalInput: {
        backgroundColor: colors.void,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        fontFamily: fonts.bodySemiBold,
        fontSize: 16,
        color: colors.textPrimary,
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: borderRadius.md,
        backgroundColor: colors.border,
        alignItems: 'center',
    },
    modalCancelText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.textPrimary,
    },
    modalDeleteBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: borderRadius.md,
        backgroundColor: colors.crimson,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    modalDeleteText: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: '#ffffff',
    },
});

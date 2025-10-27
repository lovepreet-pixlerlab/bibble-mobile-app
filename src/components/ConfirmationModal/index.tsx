import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonVariant?: 'primary' | 'secondary' | 'outline';
    cancelButtonVariant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    confirmButtonVariant = 'primary',
    cancelButtonVariant = 'outline',
    isLoading = false,
}: ConfirmationModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                    </View>

                    {/* Message */}
                    <View style={styles.messageContainer}>
                        <ThemedText style={styles.message}>{message}</ThemedText>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <ThemedButton
                            title={cancelText}
                            variant={cancelButtonVariant}
                            size="medium"
                            onPress={onCancel}
                            style={[styles.cancelButton, styles.noShadow]}
                            disabled={isLoading}
                        />
                        <ThemedButton
                            title={confirmText}
                            variant={confirmButtonVariant}
                            size="medium"
                            onPress={onConfirm}
                            style={styles.confirmButton}
                            disabled={isLoading}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(20),
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: scale(16),
        padding: scale(24),
        width: '100%',
        maxWidth: scale(320),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        marginBottom: scale(16),
    },
    title: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.darkGrey,
        textAlign: 'center',
    },
    messageContainer: {
        marginBottom: scale(24),
    },
    message: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        textAlign: 'center',
        lineHeight: scale(22),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(12),
    },
    cancelButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
    noShadow: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
});

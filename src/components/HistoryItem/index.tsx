import { ThemedText } from '@/src/components/themed-text';
import { scale } from '@/src/constants/responsive';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';

interface HistoryItemProps {
    text: string;
    onPress: () => void;
    onRemove: () => void;
}

export default function HistoryItem({ text, onPress, onRemove }: HistoryItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <ThemedText style={styles.text}>{text}</ThemedText>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <ThemedText style={styles.removeIcon}>×</ThemedText>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    text: {
        flex: 1,
        fontSize: scale(14),
        color: '#666',
    },
    removeButton: {
        width: scale(24),
        height: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIcon: {
        fontSize: scale(16),
        color: '#999',
        fontWeight: 'bold',
    },
});

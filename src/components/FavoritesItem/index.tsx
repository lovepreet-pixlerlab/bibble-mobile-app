import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface FavoritesItemProps {
    id: number;
    title: string;
    subtitle: string;
    isHighlighted?: boolean | undefined;
    onPress?: () => void;
}

export default function FavoritesItem({
    title,
    subtitle,
    onPress
}: FavoritesItemProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            // Default navigation to chapter screen
            router.push('/chapterScreen');
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <ThemedText style={[styles.title, !subtitle && styles.titleOnly]}>
                        {title}
                    </ThemedText>
                    {subtitle ? (
                        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
                    ) : null}
                </View>
                <View style={styles.arrowContainer}>
                    <Image source={Icons.arrowIcon} style={styles.arrowIcon} resizeMode='contain' />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        paddingVertical: scale(12),
        paddingHorizontal: scale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: scale(4),
    },
    titleOnly: {
        marginBottom: 0,
    },
    highlightedTitle: {
        textDecorationLine: 'underline',
        color: '#4A90E2',
    },
    subtitle: {
        fontSize: scale(14),
        color: '#666',
    },
    arrowContainer: {
        width: scale(30),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: scale(16),
        height: scale(16),
        tintColor: colors.primary,
    },
});

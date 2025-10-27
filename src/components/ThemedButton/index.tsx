import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ThemedButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function ThemedButton({
    title,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    fullWidth = false,
    style,
    ...props
}: ThemedButtonProps) {
    const buttonStyle = [
        styles.button,
        styles[size],
        fullWidth && styles.fullWidth,
        disabled ? styles.disabled : styles[variant],
        style,
    ];

    const textStyle = [
        styles.text,
        styles[`${size}Text`],
        disabled ? styles.disabledText : styles[`${variant}Text`],
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            disabled={disabled}
            {...props}
        >
            <ThemedText style={textStyle}>{title}</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: scale(60),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%',
    },

    // Size variants
    small: {
        paddingVertical: scale(8),
        paddingHorizontal: scale(16),
        minWidth: scale(80),
    },
    medium: {
        paddingVertical: scale(12),
        paddingHorizontal: scale(24),
        minWidth: scale(120),
    },
    large: {
        paddingVertical: scale(16),
        paddingHorizontal: scale(32),
        minWidth: scale(160),
    },

    // Color variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    disabled: {
        backgroundColor: '#CCCCCC',
    },

    // Text styles
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },

    // Text sizes
    smallText: {
        fontSize: scale(14),
    },
    mediumText: {
        fontSize: scale(16),
    },
    largeText: {
        fontSize: scale(18),
    },

    // Text colors
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.primary,
    },
    outlineText: {
        color: colors.primary,
    },
    disabledText: {
        color: '#999999',
    },

    // Layout
    fullWidth: {
        width: '100%',
    },
});

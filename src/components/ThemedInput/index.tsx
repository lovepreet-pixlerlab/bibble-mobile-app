import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface ThemedInputProps extends TextInputProps {
    label: string;
    required?: boolean;
    error?: string | undefined;
    showPasswordToggle?: boolean;
}

export default function ThemedInput({
    label,
    required = false,
    error,
    showPasswordToggle = false,
    secureTextEntry,
    style,
    ...props
}: ThemedInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const inputStyle = [
        styles.input,
        isFocused && styles.focusedInput,
        error && styles.errorInput,
        style,
    ];

    return (
        <View style={styles.container}>
            <ThemedText style={styles.label}>
                {label}
                {required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>

            <View style={styles.inputContainer}>
                <TextInput
                    style={inputStyle}
                    secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.textGrey}
                    {...props}
                />

                {showPasswordToggle && (
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={togglePasswordVisibility}
                    >
                        <ThemedText style={styles.passwordToggleText}>
                            {isPasswordVisible ? 'Hide' : 'Show'}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(20),
    },
    label: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.darkGrey,
        marginBottom: scale(8),
    },
    required: {
        color: colors.primary,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.borderGrey,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        fontSize: scale(16),
        color: colors.darkGrey,
        backgroundColor: colors.white,
        minHeight: scale(48),
    },
    focusedInput: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    errorInput: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    passwordToggle: {
        position: 'absolute',
        right: scale(12),
        top: '50%',
        transform: [{ translateY: -scale(10) }],
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    passwordToggleText: {
        fontSize: scale(12),
        color: colors.primary,
        fontWeight: '500',
    },
    errorText: {
        fontSize: scale(12),
        color: colors.primary,
        marginTop: scale(4),
    },
});

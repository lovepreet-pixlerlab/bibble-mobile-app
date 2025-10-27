import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useForgotPasswordMutation } from '@/src/redux/services/modules/authApi';
import { setSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    email: string;
}

interface FormErrors {
    email?: string;
}

const ForgotPasswordScreen = () => {
    const dispatch = useDispatch();
    const [forgotPasswordMutation] = useForgotPasswordMutation();
    const [formData, setFormData] = useState<FormData>({
        email: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const onForgotPasswordSuccess = (data: any) => {
        console.log('onForgotPasswordSuccess', data);
        showSuccessToast(data?.message);
        // Store email for verification screen
        setSession(STORAGE_KEYS.USER, { email: formData.email });
        // Navigate to email verification screen with forgot password source and email
        router.push(`/(auth)/emailVerification?source=forgotPassword&email=${formData.email}`);
    };

    const onForgotPasswordError = (data: any) => {
        showErrorToast(data?.data?.message || 'Failed to send verification code. Please try again.');
    };

    const handleResetPassword = async () => {
        if (!validateForm()) {
            showErrorToast('Please enter a valid email address');
            return;
        }

        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                email: formData.email,
            };

            await callApiMethod(forgotPasswordMutation, onForgotPasswordSuccess, onForgotPasswordError, payload);

        } catch (error) {
            console.error('Password reset error:', error);
            showErrorToast('Failed to send verification code. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Forgot password</ThemedText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <ThemedInput
                        label="Email"
                        required
                        placeholder="Enter your email"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={errors.email}
                    />
                </View>

                {/* Reset Password Button */}
                <ThemedButton
                    title="Reset password"
                    variant="primary"
                    size="large"
                    onPress={handleResetPassword}
                    style={styles.resetButton}
                />

                {/* Back to Login Link */}
                <View style={styles.backToLoginContainer}>
                    <ThemedText style={styles.backToLoginText}>
                        Back to{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={handleBackToLogin}>
                        <ThemedText style={styles.backToLoginLink}>
                            Log in
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(40),
    },
    header: {
        alignItems: 'center',
        marginBottom: scale(40),
    },
    title: {
        fontSize: scale(28),
        fontWeight: 'bold',
        color: colors.darkGrey,
        lineHeight: scale(36),
    },
    form: {
        marginBottom: scale(30),
    },
    resetButton: {
        marginBottom: scale(30),
    },
    backToLoginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    backToLoginText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
    },
    backToLoginLink: {
        fontSize: scale(16),
        color: colors.linkColor,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;

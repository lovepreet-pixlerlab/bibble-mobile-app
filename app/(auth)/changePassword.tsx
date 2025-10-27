import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useResetPasswordMutation } from '@/src/redux/services/modules/authApi';
import { getSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    password?: string;
    confirmPassword?: string;
}

const ChangePasswordScreen = () => {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const [resetPasswordMutation] = useResetPasswordMutation();
    const [formData, setFormData] = useState<FormData>({
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [userEmail, setUserEmail] = useState<string>('');

    // Get OTP from URL parameters
    const userOtp = params.otp as string;

    useEffect(() => {
        // Get user email from storage
        const getUserData = async () => {
            try {
                const userData = await getSession(STORAGE_KEYS.USER);
                if (userData && userData.email) {
                    setUserEmail(userData.email);
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };

        getUserData();
    }, []);



    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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

    const onResetPasswordSuccess = (data: any) => {
        console.log('onResetPasswordSuccess', data);
        showSuccessToast(data?.message || 'Password changed successfully!');
        // Navigate to password reset success screen
        router.push('/(auth)/passwordResetSuccess');
    };

    const onResetPasswordError = (data: any) => {
        console.log('onResetPasswordError', data);
        showErrorToast(data?.data?.message || 'Failed to change password. Please try again.');
    };

    const handleResetPassword = async () => {
        if (!validateForm()) {
            showErrorToast('Please fill in all fields correctly');
            return;
        }

        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                email: userEmail,
                otp: userOtp,
                newPassword: formData.password,
            };
            console.log('payload', payload);
            await callApiMethod(resetPasswordMutation, onResetPasswordSuccess, onResetPasswordError, payload);

        } catch (error) {
            console.error('Password reset error:', error);
            showErrorToast('Failed to change password. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/login');
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
                    <ThemedText style={styles.title}>Change password</ThemedText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <ThemedInput
                        label="Password"
                        required
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.password}
                    />

                    <ThemedInput
                        label="Confirm Password"
                        required
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.confirmPassword}
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

export default ChangePasswordScreen;

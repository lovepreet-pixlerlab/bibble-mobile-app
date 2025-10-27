import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useForgotPasswordMutation, useRequestVerifyEmailMutation, useResetPasswordOtpVerifyMutation, useVerifyEmailMutation } from '@/src/redux/services/modules/authApi';
import { getSession, setSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    verificationCode: string;
}

interface FormErrors {
    verificationCode?: string;
}

const EmailVerificationScreen = () => {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const [verifyEmailMutation] = useVerifyEmailMutation();
    const [resetPasswordOtpVerifyMutation] = useResetPasswordOtpVerifyMutation();
    const [requestVerifyEmailMutation] = useRequestVerifyEmailMutation();
    const [forgotPasswordMutation] = useForgotPasswordMutation();
    const [formData, setFormData] = useState<FormData>({
        verificationCode: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [userEmail, setUserEmail] = useState<string>('');

    // Get verification type from params, default to 'signup' if not provided
    const verificationType = (params.source as 'signup' | 'forgotPassword') || 'signup';

    console.log('Email verification params:', params);
    console.log('Verification type from params:', verificationType);

    useEffect(() => {
        // Get user email from parameters or storage
        const getUserData = async () => {
            try {
                // First try to get email from URL parameters
                if (params.email) {
                    setUserEmail(params.email as string);
                    console.log('Email from params:', params.email);
                } else {
                    // Fallback to storage
                    const userData = await getSession(STORAGE_KEYS.USER);
                    if (userData && userData.email) {
                        setUserEmail(userData.email);
                        console.log('Email from storage:', userData.email);
                    }
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };

        getUserData();
    }, [params.email]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Verification code validation
        if (!formData.verificationCode.trim()) {
            newErrors.verificationCode = 'Verification code is required';
        } else if (formData.verificationCode.length < 6) {
            newErrors.verificationCode = 'Verification code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        // Only allow numeric input and limit to 6 characters
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, [field]: numericValue }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const onVerificationSuccess = async (data: any) => {
        console.log('onVerificationSuccess', data);
        showSuccessToast(data?.data?.message || 'Email verified successfully!');

        if (verificationType === 'signup') {
            // For signup flow, check if token is provided and store it
            if (data?.data?.token) {
                try {
                    // Store the authentication token
                    await setSession(STORAGE_KEYS.TOKEN, data.data.token);
                    console.log('🔐 Authentication token stored successfully');

                    // Also store user data if provided
                    if (data?.data?.user) {
                        await setSession(STORAGE_KEYS.USER, data.data.user);
                        console.log('👤 User data stored successfully');
                    }
                } catch (error) {
                    console.error('❌ Error storing authentication data:', error);
                }
            }

            // Navigate to login page
            router.replace('/(auth)/login');
        } else {
            // For forgot password flow, navigate to change password with OTP parameter
            router.push(`/(auth)/changePassword?otp=${formData.verificationCode}`);
        }
    };

    const onVerificationError = (data: any) => {
        console.log('onVerificationError', data);
        showErrorToast(data?.data?.message || 'Verification failed');
    };

    const handleVerifyCode = async () => {
        if (!validateForm()) {
            showErrorToast('Please enter a valid verification code');
            return;
        }

        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                email: userEmail,
                otp: formData.verificationCode,
            };

            // Use different API based on verification type
            if (verificationType === 'signup') {
                await callApiMethod(verifyEmailMutation, onVerificationSuccess, onVerificationError, payload);
            } else {
                // For forgot password flow, use reset-password API
                await callApiMethod(resetPasswordOtpVerifyMutation, onVerificationSuccess, onVerificationError, payload);
            }

        } catch (error) {
            onVerificationError({ data: { message: 'Verification failed. Please try again.' } });
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const onResendSuccess = (data: any) => {
        showSuccessToast(data?.data?.message || 'Verification code sent to your email');
    };

    const onResendError = (data: any) => {
        showErrorToast(data?.data?.message || 'Failed to resend code. Please try again.');
    };

    const handleResendCode = async () => {
        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                email: userEmail,
            };


            // Use different API based on verification type
            if (verificationType === 'signup') {
                console.log('Using requestVerifyEmailMutation for signup resend');
                await callApiMethod(requestVerifyEmailMutation, onResendSuccess, onResendError, payload);
            } else {
                console.log('Using forgotPasswordMutation for forgot password resend');
                // For forgot password flow, use the same API as forgot password screen
                await callApiMethod(forgotPasswordMutation, onResendSuccess, onResendError, payload);
            }
        } catch (error) {
            console.error('Resend error:', error);
            showErrorToast('Failed to resend code. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    const getTitle = () => {
        return verificationType === 'signup' ? 'Verify Your Email' : 'Email Verification';
    };

    const getDescription = () => {
        if (verificationType === 'signup') {
            return `We've sent a verification code to ${userEmail}. Please enter the code below to verify your email address.`;
        } else {
            return `We've sent a verification code to ${userEmail}. Please enter the code below to reset your password.`;
        }
    };

    const getButtonTitle = () => {
        return verificationType === 'signup' ? 'Verify Email' : 'Verify Code';
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
                    <ThemedText style={styles.title}>{getTitle()}</ThemedText>
                    <ThemedText style={styles.description}>
                        {getDescription()}
                    </ThemedText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <ThemedInput
                        label="Enter verification code"
                        required
                        placeholder="******"
                        value={formData.verificationCode}
                        onChangeText={(value) => handleInputChange('verificationCode', value)}
                        keyboardType="numeric"
                        maxLength={6}
                        secureTextEntry
                        error={errors.verificationCode}
                    />
                </View>

                {/* Verify Button */}
                <ThemedButton
                    title={getButtonTitle()}
                    variant="primary"
                    size="large"
                    onPress={handleVerifyCode}
                    style={styles.verifyButton}
                />

                {/* Resend Code */}
                <TouchableOpacity
                    style={styles.resendContainer}
                    onPress={handleResendCode}
                >
                    <ThemedText style={styles.resendText}>
                        Didn't receive the code?{' '}
                    </ThemedText>
                    <ThemedText style={styles.resendLink}>
                        Resend
                    </ThemedText>
                </TouchableOpacity>

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
        textAlign: 'center',
        marginBottom: scale(16),
    },
    description: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        textAlign: 'center',
        lineHeight: scale(24),
        paddingHorizontal: scale(20),
    },
    form: {
        marginBottom: scale(30),
    },
    verifyButton: {
        marginBottom: scale(20),
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scale(30),
    },
    resendText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
    },
    resendLink: {
        fontSize: scale(16),
        color: colors.linkColor,
        fontWeight: '600',
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

export default EmailVerificationScreen;
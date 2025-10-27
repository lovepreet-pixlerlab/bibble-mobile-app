import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useLoginMutation } from '@/src/redux/services/modules/authApi';
import { setSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { showErrorToast } from '@/src/utils/toast';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

const LoginScreen = () => {
    const [loginMutation] = useLoginMutation();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
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

        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    const onloginError = (data: any) => {
        showErrorToast(data?.data?.message);
    }
    const onloginSuccess = (data: any) => {
        // Navigate to language selection
        router.replace('/(onBoardingStack)/language');
        setSession(STORAGE_KEYS.TOKEN, data.token);
    }

    const handleLogin = async () => {
        if (!validateForm()) {
            showErrorToast('Please fill in all fields correctly');
            return;
        }

        try {
            dispatch(setLoaderStatus(true))
            // TODO: Implement actual login logic
            const payload = {
                email: formData.email,
                password: formData.password,
            }
            // Simulate API call
            await callApiMethod(loginMutation, onloginSuccess, onloginError, payload);

        } catch (error) {
            console.error('Login error:', error);
            // Handle login error
        } finally {
            dispatch(setLoaderStatus(false))
        }
    };

    const handleForgotPassword = () => {
        router.push('/(auth)/forgotPassword');
    };

    const handleSignUp = () => {
        console.log('Sign up pressed');
        // TODO: Navigate to sign up screen
        router.push('(auth)/signup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView>


                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>Log in</ThemedText>
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

                        <ThemedInput
                            label="Password"
                            required
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(value) => handleInputChange('password', value)}
                            secureTextEntry
                            showPasswordToggle
                            error={errors.password}
                        />

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={handleForgotPassword}
                        >
                            <ThemedText style={styles.forgotPasswordText}>
                                Forgot password
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <ThemedButton
                        title="Sign in"
                        variant="primary"
                        size="large"
                        onPress={handleLogin}
                        style={styles.signInButton}
                    />

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <ThemedText style={styles.signUpText}>
                            Don't have any account?{' '}
                        </ThemedText>
                        <TouchableOpacity onPress={handleSignUp}>
                            <ThemedText style={styles.signUpLink}>
                                Sign up
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
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
        lineHeight: scale(36),
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: scale(-10),
        marginBottom: scale(20),
    },
    forgotPasswordText: {
        fontSize: scale(14),
        color: colors.linkColor,
        fontWeight: '500',
    },
    signInButton: {
        marginBottom: scale(30),
    },
    signUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    signUpText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
    },
    signUpLink: {
        fontSize: scale(16),
        color: colors.linkColor,
        fontWeight: '600',
    },
});

export default LoginScreen;

import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useRegisterMutation } from '@/src/redux/services/modules/authApi';
import { setSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const SignupScreen = () => {
    const [registerMutation] = useRegisterMutation();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

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

    const onSignupSuccess = (data: any) => {
        showSuccessToast(data?.data?.message);
        // Store user data
        setSession(STORAGE_KEYS.USER, data.data);
        console.log('onSignupSuccess', data);

        // Navigate to email verification with signup source and email
        router.replace(`/(auth)/emailVerification?source=signup&email=${data.data.email}`);
    };

    const onSignupError = (data: any) => {
        console.log('onSignupError', data);
        showErrorToast(data?.data?.message || 'Registration failed');
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            showErrorToast('Please fill in all fields correctly');
            return;
        }

        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            };

            await callApiMethod(registerMutation, onSignupSuccess, onSignupError, payload);

        } catch (error) {
            console.error('Signup error:', error);
            showErrorToast('Something went wrong. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleLogin = () => {
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
                    <ThemedText style={styles.title}>Sign up</ThemedText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <ThemedInput
                        label="Name"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        autoCapitalize="words"
                        error={errors.name}
                    />

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

                    <ThemedInput
                        label="Confirm Password"
                        required
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.confirmPassword}
                    />
                </View>

                {/* Sign Up Button */}
                <ThemedButton
                    title="Sign up"
                    variant="primary"
                    size="large"
                    onPress={handleSignup}
                    style={styles.signUpButton}
                />

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <ThemedText style={styles.loginText}>
                        Already have an account?{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={handleLogin}>
                        <ThemedText style={styles.loginLink}>
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
    signUpButton: {
        marginBottom: scale(30),
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    loginText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
    },
    loginLink: {
        fontSize: scale(16),
        color: colors.linkColor,
        fontWeight: '600',
    },
});

export default SignupScreen;

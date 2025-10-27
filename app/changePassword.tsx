import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setLoaderStatus } from '@/src/redux/features/global';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useChangePasswordMutation } from '@/src/redux/services/modules/authApi';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface FormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const ChangePasswordScreen = () => {
    const dispatch = useDispatch();
    const [changePasswordMutation] = useChangePasswordMutation();

    const [formData, setFormData] = useState<FormData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Old password validation
        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = 'Current password is required';
        }

        // New password validation
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Check if new password is same as old password
        if (formData.oldPassword && formData.newPassword &&
            formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
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

    const onChangePasswordSuccess = (data: any) => {
        console.log('onChangePasswordSuccess', data);
        showSuccessToast(data?.message || 'Password changed successfully!');
        // Navigate back to settings
        router.back();
    };

    const onChangePasswordError = (data: any) => {
        console.log('onChangePasswordError', data);
        showErrorToast(data?.data?.message || 'Failed to change password. Please try again.');
    };

    const handleChangePassword = async () => {
        if (!validateForm()) {
            showErrorToast('Please fill in all fields correctly');
            return;
        }

        try {
            dispatch(setLoaderStatus(true));

            const payload = {
                password: formData.oldPassword,
                newPassword: formData.newPassword,
            };

            console.log('Change password payload:', payload);
            await callApiMethod(changePasswordMutation, onChangePasswordSuccess, onChangePasswordError, payload);

        } catch (error) {
            console.error('Change password error:', error);
            showErrorToast('Failed to change password. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Image source={Icons.backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Form */}
                <View style={styles.form}>
                    <ThemedInput
                        label="Current Password"
                        required
                        placeholder="Enter your current password"
                        value={formData.oldPassword}
                        onChangeText={(value) => handleInputChange('oldPassword', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.oldPassword}
                    />

                    <ThemedInput
                        label="New Password"
                        required
                        placeholder="Enter your new password"
                        value={formData.newPassword}
                        onChangeText={(value) => handleInputChange('newPassword', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.newPassword}
                    />

                    <ThemedInput
                        label="Confirm New Password"
                        required
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        secureTextEntry
                        showPasswordToggle
                        error={errors.confirmPassword}
                    />
                </View>

                {/* Change Password Button */}
                <ThemedButton
                    title="Change Password"
                    variant="primary"
                    size="large"
                    onPress={handleChangePassword}
                    style={styles.changePasswordButton}
                />

                {/* Info Text */}
                <View style={styles.infoContainer}>
                    <ThemedText style={styles.infoText}>
                        Make sure your new password is strong and different from your current password.
                    </ThemedText>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
        minHeight: scale(60),
    },
    backButton: {
        padding: scale(8),
        marginRight: scale(12),
        width: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: scale(24),
        height: scale(24),
        resizeMode: 'contain',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(8),
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.darkGrey,
        textAlign: 'center',
        lineHeight: scale(22),
    },
    headerSpacer: {
        width: scale(40),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: scale(20),
        paddingVertical: scale(24),
    },
    form: {
        marginBottom: scale(30),
    },
    changePasswordButton: {
        marginBottom: scale(20),
    },
    infoContainer: {
        backgroundColor: colors.lightGrey2,
        borderRadius: scale(8),
        padding: scale(16),
        marginTop: scale(10),
    },
    infoText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
        lineHeight: scale(20),
        textAlign: 'center',
    },
});

export default ChangePasswordScreen;

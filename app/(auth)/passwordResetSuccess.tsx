import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PasswordResetSuccessScreen = () => {
    const handleContinue = () => {
        // Navigate to login screen
        router.replace('/(auth)/login');
    };

    const handleBackToLogin = () => {
        // Navigate to login screen
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Password reset</ThemedText>
                    <ThemedText style={styles.description}>
                        Your password has been successfully reset.
                    </ThemedText>
                </View>

                {/* Continue Button */}
                <ThemedButton
                    title="Continue"
                    variant="primary"
                    size="large"
                    onPress={handleContinue}
                    style={styles.continueButton}
                />

                {/* Back to Login Link */}
                <View style={styles.backToLoginContainer}>
                    <ThemedText style={styles.backToLoginText}>
                        Back to{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={handleBackToLogin}>
                        <ThemedText style={styles.backToLoginLink}>
                            Log In
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(20),
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
    continueButton: {
        marginBottom: scale(30),
        minWidth: scale(200),
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

export default PasswordResetSuccessScreen;

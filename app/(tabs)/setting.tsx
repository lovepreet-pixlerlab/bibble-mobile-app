
import { Icons } from '@/src/assets/icons';
import ConfirmationModal from '@/src/components/ConfirmationModal';
import PaymentModal from '@/src/components/PaymentModal';
import { ThemedText } from '@/src/components/themed-text';
import { STRIPE_CONFIG } from '@/src/config/stripe';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useUser } from '@/src/hooks/useUser';
import { clearUser, setPaidReader } from '@/src/redux/features/user';
import { clearUserPreferences } from '@/src/redux/features/userPreferences';
import { clearSession } from '@/src/utils/localStorage';
import { showSuccessToast } from '@/src/utils/toast';
import { StripeProvider } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const SettingScreen = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const dispatch = useDispatch();
    const { userName, userEmail, isPaidReader } = useUser();

    const handleEditProfile = () => {
        router.push('/editProfile');
    };

    const handleFontSize = () => {
        router.push('/fontSize');
    };

    const handleChangePassword = () => {
        router.push('/changePassword');
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = async () => {
        try {
            // Clear all AsyncStorage data
            await clearSession();

            // Clear Redux state
            dispatch(clearUser());
            dispatch(clearUserPreferences());

            // Show success message
            showSuccessToast('Logged out successfully');

            // Navigate to login screen
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
            showSuccessToast('Logged out successfully');
            router.replace('/(auth)/login');
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleDeleteAccount = () => {
        console.log('Delete Account pressed');
    };

    const handlePremiumUpgrade = () => {
        console.log('Premium Upgrade pressed');
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (paymentData: any) => {
        console.log('Payment successful:', paymentData);
        console.log('Payment verification:', paymentData.verification);

        // Update user as paid reader
        dispatch(setPaidReader(true));

        setShowPaymentModal(false);
        showSuccessToast('Welcome to Premium! You now have full access to all features.');
    };

    return (
        <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.headerTitle}>Setting</ThemedText>
                    </View>

                    {/* User Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <ThemedText style={styles.avatarText}>
                                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={styles.profileInfo}>
                                <ThemedText style={styles.userName}>{userName || 'User'}</ThemedText>
                                <ThemedText style={styles.userEmail}>{userEmail || 'user@example.com'}</ThemedText>
                                {isPaidReader && (
                                    <ThemedText style={styles.premiumBadge}>Premium User</ThemedText>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* General Settings Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>General</ThemedText>
                        <View style={styles.settingsCard}>
                            <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
                                <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.settingItem} onPress={handleFontSize}>
                                <ThemedText style={styles.settingText}>Font Size</ThemedText>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Premium Section - Only show for non-paid readers */}
                    {!isPaidReader && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Premium</ThemedText>
                            <View style={styles.settingsCard}>
                                <TouchableOpacity style={styles.settingItem} onPress={handlePremiumUpgrade}>
                                    <View style={styles.premiumItemContent}>
                                        <View style={styles.premiumIconContainer}>
                                            <Image source={Icons.crownIcon} style={styles.premiumIcon} />
                                        </View>
                                        <View style={styles.premiumTextContainer}>
                                            <ThemedText style={styles.premiumTitle}>Upgrade to Premium</ThemedText>
                                            <ThemedText style={styles.premiumSubtitle}>Only $7 for lifetime access</ThemedText>
                                        </View>
                                    </View>
                                    <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Other Settings Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Other</ThemedText>
                        <View style={styles.settingsCard}>
                            <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
                                <ThemedText style={styles.settingText}>Change password</ThemedText>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                                <ThemedText style={styles.settingText}>Logout</ThemedText>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
                                <ThemedText style={[styles.settingText, styles.deleteText]}>Delete account</ThemedText>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Logout Confirmation Modal */}
                <ConfirmationModal
                    visible={showLogoutModal}
                    title="Logout"
                    message="Are you sure you want to logout? You will need to login again to access your account."
                    confirmText="Logout"
                    cancelText="Cancel"
                    onConfirm={handleConfirmLogout}
                    onCancel={handleCancelLogout}
                    confirmButtonVariant="primary"
                    cancelButtonVariant="outline"
                />

                {/* Payment Modal */}
                <PaymentModal
                    visible={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    amount={7} // $7.00 in dollars
                    planName="Premium Lifetime Access"
                />
            </SafeAreaView>
        </StripeProvider>
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
    header: {
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
        paddingBottom: scale(10),
    },
    headerTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#333333',
    },
    profileSection: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(20),
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: scale(15),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarContainer: {
        marginRight: scale(15),
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: scale(20),
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#333333',
        marginBottom: scale(4),
    },
    userEmail: {
        fontSize: scale(14),
        color: '#666666',
    },
    premiumBadge: {
        fontSize: scale(12),
        color: colors.primary,
        fontWeight: '600',
        marginTop: scale(4),
    },
    section: {
        paddingHorizontal: scale(20),
        marginBottom: scale(20),
    },
    sectionTitle: {
        fontSize: scale(14),
        color: '#999999',
        marginBottom: scale(10),
        marginLeft: scale(5),
    },
    settingsCard: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
    },
    settingText: {
        fontSize: scale(16),
        color: '#333333',
    },
    deleteText: {
        color: '#FF4444',
    },
    arrowIcon: {
        width: scale(16),
        height: scale(16),
        resizeMode: 'contain',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: scale(20),
    },
    premiumItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    premiumIconContainer: {
        marginRight: scale(12),
    },
    premiumIcon: {
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
        tintColor: colors.primary,
    },
    premiumTextContainer: {
        flex: 1,
    },
    premiumTitle: {
        fontSize: scale(16),
        color: colors.primary,
        fontWeight: '600',
        marginBottom: scale(2),
    },
    premiumSubtitle: {
        fontSize: scale(12),
        color: '#666666',
    },
});

export default SettingScreen;

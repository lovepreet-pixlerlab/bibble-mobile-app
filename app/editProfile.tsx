import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import ThemedInput from '@/src/components/ThemedInput';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useUser } from '@/src/hooks/useUser';
import { setLoaderStatus } from '@/src/redux/features/global';
import { updateUser } from '@/src/redux/features/user';
import { useUpdateAccountMutation } from '@/src/redux/services/modules/userApi';
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

const EditProfileScreen = () => {
    const dispatch = useDispatch();
    const { userName, userEmail } = useUser();
    const [updateAccount] = useUpdateAccountMutation();

    const [name, setName] = useState(userName || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleBackPress = () => {
        router.back();
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showErrorToast('Please enter a valid name');
            return;
        }

        if (name.trim() === userName) {
            showSuccessToast('No changes to save');
            return;
        }

        try {
            setIsLoading(true);
            dispatch(setLoaderStatus(true));

            const payload = {
                name: name.trim()
            };

            const response = await updateAccount(payload).unwrap();

            if (response.success) {
                showSuccessToast('Profile updated successfully!');
                // Update Redux user state with new name
                dispatch(updateUser({ name: name.trim() }));
                router.back();
            } else {
                showErrorToast(response.message || 'Failed to update profile');
            }

        } catch (error) {
            console.error('❌ Error updating profile:', error);
            showErrorToast('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
            dispatch(setLoaderStatus(false));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Image source={Icons.backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    {/* Name Field */}
                    <View style={styles.inputContainer}>
                        <ThemedInput
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            editable={true}
                            style={styles.input}
                        />
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <ThemedInput
                            label="Email"
                            value={userEmail || ''}
                            placeholder="Email address"
                            editable={false}
                            style={[styles.input, styles.disabledInput]}
                        />
                        <ThemedText style={styles.disabledText}>
                            Email cannot be changed
                        </ThemedText>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <ThemedButton
                    title={isLoading ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    disabled={isLoading || !name.trim() || name.trim() === userName}
                    style={styles.saveButton}
                />
            </View>
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
    },
    headerSpacer: {
        width: scale(40),
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
    },
    formContainer: {
        paddingTop: scale(32),
        paddingBottom: scale(20),
    },
    inputContainer: {
        marginBottom: scale(24),
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey2,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        fontSize: scale(16),
        color: colors.darkGrey,
    },
    disabledInput: {
        backgroundColor: colors.lightGrey2,
        color: colors.mediumGrey,
        borderColor: colors.lightGrey2,
    },
    disabledText: {
        fontSize: scale(12),
        color: colors.mediumGrey,
        marginTop: scale(4),
        fontStyle: 'italic',
    },
    footer: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        paddingBottom: scale(20),
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey2,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: scale(8),
        paddingVertical: scale(14),
    },
});

export default EditProfileScreen;

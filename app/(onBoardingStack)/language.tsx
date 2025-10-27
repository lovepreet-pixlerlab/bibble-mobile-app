import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useUser } from '@/src/hooks/useUser';
import {
    setAvailableLanguages,
    setSelectedLanguage as setSelectedLanguageAction,
    setSelectedLanguageInfo
} from '@/src/redux/features/userPreferences';
import { useLazyGetLanguagesQuery } from '@/src/redux/services/modules/userApi';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const LanguageScreen = () => {
    const dispatch = useDispatch();
    const { isPaidReader } = useUser();
    const {
        selectedLanguage: savedLanguage,
        availableLanguages: savedLanguages
    } = useSelector((state: any) => state.userPreferences);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(savedLanguage);

    // Use lazy query to fetch languages
    const [getLanguages, { data: response, isLoading, error }] = useLazyGetLanguagesQuery();

    // Extract languages from nested response or use saved languages
    const apiLanguages = (response as any)?.data || [];
    const languages = apiLanguages.length > 0 ? apiLanguages : savedLanguages;

    // Fetch languages on component mount
    React.useEffect(() => {
        getLanguages(undefined);
    }, [getLanguages]);

    // Save languages to Redux when API data is available
    React.useEffect(() => {
        if (languages.length > 0) {
            dispatch(setAvailableLanguages(languages));
        }
    }, [languages, dispatch]);

    // Debug: Log the response structure


    const handleLanguageSelect = (languageId: string) => {
        setSelectedLanguage(languageId);

        // Find the complete language object
        const languageInfo = languages.find((lang: any) => lang.code === languageId);

        // Save to Redux store immediately
        dispatch(setSelectedLanguageAction(languageId));

        // Save complete language info
        if (languageInfo) {
            dispatch(setSelectedLanguageInfo(languageInfo));
        }
    };

    const handleDone = () => {
        if (selectedLanguage) {

            // Check if user is a paid reader
            if (isPaidReader === true) {
                router.replace('/(tabs)');
            } else {
                router.push('/(onBoardingStack)/plan');
            }
        }
    };

    // Show loading state only if we don't have saved languages
    if (isLoading && savedLanguages.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading languages...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <ThemedText style={styles.errorText}>Failed to load languages</ThemedText>
                    <ThemedButton
                        title="Retry"
                        variant="primary"
                        size="medium"
                        onPress={() => getLanguages(undefined)}
                        style={styles.retryButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <ThemedText style={styles.title}>Select a language</ThemedText>

                {/* Language Grid */}
                <View style={styles.languageGrid}>
                    {Array.isArray(languages) && languages.length > 0 ? (
                        languages.map((language: any) => (
                            <TouchableOpacity
                                key={language._id}
                                style={[
                                    styles.languageButton,
                                    selectedLanguage === language.code && styles.selectedLanguage
                                ]}
                                onPress={() => handleLanguageSelect(language.code)}
                            >
                                <ThemedText style={[
                                    styles.languageText,
                                    selectedLanguage === language.code && styles.selectedLanguageText
                                ]}>
                                    {language.name}
                                </ThemedText>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <ThemedText style={styles.noLanguagesText}>
                            No languages available
                        </ThemedText>
                    )}
                </View>

                {/* Done Button */}
                <ThemedButton
                    title="Done"
                    variant="primary"
                    size="large"
                    disabled={!selectedLanguage}
                    onPress={handleDone}
                    style={styles.doneButton}
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(20),
    },
    title: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: scale(40),
        textAlign: 'center',
    },
    languageGrid: {
        width: '100%',
        maxWidth: scale(300),
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: scale(40),
    },
    languageButton: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: scale(12),
        paddingVertical: scale(16),
        paddingHorizontal: scale(20),
        marginBottom: scale(12),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedLanguage: {
        borderColor: colors.primary,
        backgroundColor: colors.lightRed,
    },
    languageText: {
        fontSize: scale(16),
        color: '#333333',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedLanguageText: {
        color: colors.primary,
        fontWeight: '600',
    },
    doneButton: {
        minWidth: scale(200),
    },
    loadingText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        marginTop: scale(16),
        textAlign: 'center',
    },
    errorText: {
        fontSize: scale(16),
        color: colors.primary,
        marginBottom: scale(20),
        textAlign: 'center',
    },
    retryButton: {
        minWidth: scale(120),
    },
    noLanguagesText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default LanguageScreen;

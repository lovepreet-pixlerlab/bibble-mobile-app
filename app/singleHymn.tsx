import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useFontSize } from '@/src/hooks/useFontSize';
import { setLoaderStatus } from '@/src/redux/features/global';
import { setSelectedLanguage, setSelectedLanguageInfo } from '@/src/redux/features/userPreferences';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useAddToFavoritesMutation, useLazyGetSingleHymnQuery, useRemoveFromFavoritesMutation } from '@/src/redux/services/modules/userApi';
import { processHymnContentToLines } from '@/src/utils/htmlUtils';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

interface HymnData {
    _id: string;
    id: string;
    title: any; // Object with language translations
    content: any; // Object with language translations
    description?: any;
    contentType: string;
    type: string;
    status: string;
    freePages: number;
    views: number;
    shares: number;
    userId: string;
    createdAt: string;
}

const SingleHymnScreen = () => {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const hymnId = params.id as string || params.hymnId as string; // Handle both naming conventions
    const hymnTitle = params.title as string || params.hymnTitle as string; // Handle both naming conventions



    // Determine navigation source based on parameter names
    const navigationSource = params.hymnId ? 'search screen' : 'hymns screen';

    // Get selected language and available languages from Redux persist
    const { selectedLanguage, availableLanguages } = useSelector((state: any) => state.userPreferences);

    // Get font size using custom hook
    const { getVerseFontSize } = useFontSize();



    // Check if languages are properly persisted
    if (availableLanguages && availableLanguages.length > 0) {
        console.log('✅ Languages successfully loaded from Redux Persist');
    } else {
        console.warn('⚠️ No languages found in Redux Persist - may need to fetch from API first');
    }

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<string | null>(null);
    const [hymnData, setHymnData] = useState<HymnData | null>(null);
    const [productId, setProductId] = useState<string | null>(null);
    const [hymnDataId, setHymnDataId] = useState<string | null>(null);

    // Lazy query for single hymn
    const [getSingleHymn, { data, isLoading, error }] = useLazyGetSingleHymnQuery();

    // Favorites mutations
    const [addToFavorites] = useAddToFavoritesMutation();
    const [removeFromFavorites] = useRemoveFromFavoritesMutation();

    // Fetch hymn data on component mount
    useEffect(() => {
        if (hymnId) {
            getSingleHymn(hymnId);
        } else {
            console.error('❌ SingleHymnScreen - No hymnId provided, cannot fetch hymn data');
        }
    }, [hymnId, getSingleHymn]);

    // Handle API response
    useEffect(() => {
        console.log('📦 SingleHymnScreen - API response useEffect triggered');
        console.log('📦 SingleHymnScreen - Data received:', data);
        console.log('📦 SingleHymnScreen - Loading state:', isLoading);
        console.log('📦 SingleHymnScreen - Error state:', error);

        try {
            if (data) {
                const response = data as any;
                console.log('📦 SingleHymnScreen - Full API Response:', response);

                // Validate response structure
                if (!response || typeof response !== 'object') {
                    console.warn('⚠️ Invalid response structure');
                    return;
                }

                if (response.success && response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    // Get all verses, not just the first one
                    const allVerses = response.data.data;
                    const product = response.data.product || {};

                    // Store productId from the product object
                    if (product._id) {
                        setProductId(product._id);
                        console.log('📦 Product ID stored:', product._id);
                    }

                    // Store hymn data ID from the first verse
                    if (allVerses.length > 0 && allVerses[0]._id) {
                        setHymnDataId(allVerses[0]._id);
                        console.log('🎵 Hymn Data ID stored:', allVerses[0]._id);
                    }

                    // Validate verses array
                    if (!Array.isArray(allVerses) || allVerses.length === 0) {
                        console.warn('⚠️ No verses found in response');
                        return;
                    }

                    // Combine all verses into one content object
                    const combinedContent: any = {};
                    const currentLanguage = selectedLanguage || 'en';

                    // Process each verse and combine the text content
                    allVerses.forEach((verse: any, index: number) => {
                        try {
                            // Validate verse structure
                            if (!verse || typeof verse !== 'object') {
                                console.warn(`⚠️ Invalid verse at index ${index}:`, verse);
                                return;
                            }

                            if (verse.text && typeof verse.text === 'object' && verse.text[currentLanguage]) {
                                if (!combinedContent[currentLanguage]) {
                                    combinedContent[currentLanguage] = '';
                                }
                                // Add verse content with proper line breaks (no verse headers)
                                // Ensure each verse starts on a completely new line
                                const verseText = verse.text[currentLanguage];
                                if (typeof verseText === 'string' && verseText.trim()) {
                                    combinedContent[currentLanguage] += `${verseText.trim()}\n\n`;
                                }
                            }
                        } catch (verseError) {
                            console.error(`❌ Error processing verse at index ${index}:`, verseError);
                        }
                    });

                    // Validate that we have content
                    if (!combinedContent[currentLanguage] || combinedContent[currentLanguage].trim() === '') {
                        console.warn('⚠️ No content found for selected language');
                        return;
                    }

                    // Map the API response to our expected structure with fallbacks
                    const firstVerse = allVerses[0] || {};
                    const mappedHymnData = {
                        _id: firstVerse._id || 'unknown',
                        id: firstVerse.id || firstVerse._id || 'unknown',
                        title: product?.title || firstVerse.title || hymnTitle || 'Untitled',
                        content: combinedContent,
                        description: firstVerse.description || '',
                        contentType: 'hymn',
                        type: product?.type || firstVerse.type || 'hymn',
                        status: firstVerse.status || 'active',
                        freePages: firstVerse.freePages || 0,
                        views: firstVerse.views || 0,
                        shares: firstVerse.shares || 0,
                        userId: firstVerse.userId || 'unknown',
                        createdAt: firstVerse.createdAt || new Date().toISOString(),
                    };

                    console.log('🔄 Mapped Hymn Data:', mappedHymnData);
                    setHymnData(mappedHymnData);

                    // Debug: Log the product object to see favorite status
                    console.log('🔍 Product object:', product);
                    console.log('🔍 Product.isFav:', product?.isFav);
                    console.log('🔍 All verses favorite status:', allVerses.map((verse: any) => ({
                        verseId: verse._id,
                        isFav: verse.isFav
                    })));

                    // Set favorite state based on isFav from API response
                    // Check both product and verses for favorite status
                    let favoriteStatus = product?.isFav;
                    let favoriteIdValue = null;

                    if (favoriteStatus) {
                        console.log('❤️ Hymn is already favorited (from product):', favoriteStatus);
                        favoriteIdValue = favoriteStatus._id || favoriteStatus.id;
                    } else {
                        // Check if any verse is favorited
                        const favoritedVerse = allVerses.find((verse: any) => verse.isFav);
                        if (favoritedVerse) {
                            console.log('❤️ Hymn is already favorited (from verse):', favoritedVerse.isFav);
                            favoriteStatus = favoritedVerse.isFav;
                            favoriteIdValue = favoriteStatus._id || favoriteStatus.id;
                        } else {
                            console.log('💔 Hymn is not favorited');
                        }
                    }

                    setIsFavorite(!!favoriteStatus);
                    setFavoriteId(favoriteIdValue);
                } else {
                    console.log('❌ No data found in response:', response);
                }
            }
        } catch (error) {
            console.error('❌ Error processing hymn data:', error);
            // Set a fallback state to prevent crash
            setHymnData({
                _id: 'error',
                id: 'error',
                title: hymnTitle || 'Error Loading Hymn',
                content: { [selectedLanguage || 'en']: 'Unable to load hymn content. Please try again.' },
                description: '',
                contentType: 'hymn',
                type: 'hymn',
                status: 'error',
                freePages: 0,
                views: 0,
                shares: 0,
                userId: 'unknown',
                createdAt: new Date().toISOString(),
            });
        }
    }, [data, selectedLanguage, hymnTitle]);

    // Extract title and content based on selected language
    const currentLanguage = selectedLanguage || 'en'; // Default to English if null

    const displayTitle = hymnData?.title
        ? (typeof hymnData.title === 'object'
            ? (hymnData.title[currentLanguage] || hymnData.title.en || hymnData.title.english || Object.values(hymnData.title)[0] || 'Untitled')
            : hymnData.title)
        : hymnTitle || 'Loading...';





    // Debug: Show all text content for each language
    if (hymnData?.content && typeof hymnData.content === 'object') {
        console.log('🌍 All Text Content by Language:');
        Object.entries(hymnData.content).forEach(([lang, text]) => {
            console.log(`  ${lang}:`, text);
        });

        // Show the selected language content specifically
        if (hymnData.content[currentLanguage]) {
            console.log(`🎯 Selected Language (${currentLanguage}) Content:`, hymnData.content[currentLanguage]);
        }
    }



    // Process content using hymn-specific utility function
    const contentLines = React.useMemo(() => {
        try {
            if (!hymnData?.content) return [];

            // Extract content in selected language with fallbacks
            let extractedContent = '';
            if (typeof hymnData.content === 'object' && hymnData.content !== null) {
                extractedContent = hymnData.content[currentLanguage] ||
                    hymnData.content.en ||
                    hymnData.content.english ||
                    Object.values(hymnData.content)[0] ||
                    '';
            } else if (typeof hymnData.content === 'string') {
                extractedContent = hymnData.content;
            }

            // Validate extracted content
            if (!extractedContent || typeof extractedContent !== 'string') {
                console.warn('⚠️ No valid content found for processing');
                return [];
            }

            // Use hymn-specific processing for proper verse formatting
            const lines = processHymnContentToLines(extractedContent);

            return lines;
        } catch (error) {
            return ['Error processing hymn content. Please try again.'];
        }
    }, [hymnData?.content, currentLanguage]);
    const handleBackPress = () => {
        router.back();
    };

    const onFavoriteSuccess = (data: any) => {
        console.log('✅ Successfully added to favorites:', data);
        showSuccessToast('Added to favorites!');
        setIsFavorite(true);
        // Store the favorite ID from the response
        if (data?.data?._id) {
            setFavoriteId(data.data._id);
        }
    };

    const onRemoveFavoriteSuccess = (data: any) => {
        console.log('✅ Successfully removed from favorites:', data);
        showSuccessToast('Removed from favorites!');
        setIsFavorite(false);
        setFavoriteId(null);
    };

    const onFavoriteError = (error: any) => {
        console.error('❌ Error with favorites:', error);
        showErrorToast('Failed to update favorites. Please try again.');
    };

    const handleFavoritePress = async () => {
        try {
            if (!hymnDataId) {
                console.warn('⚠️ No hymn data ID available for favorites');
                showErrorToast('No hymn data ID available');
                return;
            }

            dispatch(setLoaderStatus(true));

            if (isFavorite && favoriteId) {
                // Remove from favorites
                console.log('💔 Removing hymn from favorites:', favoriteId);
                await callApiMethod(removeFromFavorites, onRemoveFavoriteSuccess, onFavoriteError, favoriteId);
            } else {
                // Add to favorites
                console.log('❤️ Adding hymn to favorites:', hymnDataId);
                const payload = {
                    hymnId: hymnDataId,
                };
                await callApiMethod(addToFavorites, onFavoriteSuccess, onFavoriteError, payload);
            }
        } catch (error) {
            console.error('❌ Error in handleFavoritePress:', error);
            showErrorToast('Failed to update favorites. Please try again.');
        } finally {
            dispatch(setLoaderStatus(false));
        }
    };

    const handleLanguagePress = () => {
        try {

            if (!availableLanguages || availableLanguages.length === 0) {
                console.warn('⚠️ No available languages found in Redux Persist');
                console.warn('⚠️ Please ensure languages are loaded from API and saved to Redux Persist');
                return;
            }

            // Find current language index
            const currentIndex = availableLanguages.findIndex((lang: any) => lang.code === currentLanguage);
            console.log('Current language index:', currentIndex);

            // Get next language (cycle to first if at end)
            const nextIndex = (currentIndex + 1) % availableLanguages.length;
            const nextLanguage = availableLanguages[nextIndex];

            if (nextLanguage) {
                // Update selected language in Redux
                dispatch(setSelectedLanguage(nextLanguage.code));
                dispatch(setSelectedLanguageInfo(nextLanguage));
            } else {
                console.warn('⚠️ No next language found');
            }

        } catch (error) {
            console.error('❌ Error switching language:', error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                        <Image source={Icons.backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading hymn...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                        <Image source={Icons.backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Error</ThemedText>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Failed to load hymn</ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            console.log('🔄 Retrying API call with hymnId:', hymnId);
                            getSingleHymn(hymnId);
                        }}
                    >
                        <ThemedText style={styles.retryText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Image source={Icons.backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">
                        {displayTitle}
                    </ThemedText>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.lyricsContainer}>

                    {/* Main Content */}
                    {isLoading ? (
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <ThemedText style={styles.loadingContentText}>Loading content...</ThemedText>
                        </View>
                    ) : contentLines.length > 0 ? (
                        contentLines.map((line: string, index: number) => {
                            try {
                                // Handle empty lines for verse spacing
                                if (!line || line.trim() === '') {
                                    return <View key={index} style={styles.verseSpacing} />;
                                }

                                // Handle visual separator lines
                                if (line.trim() === '---') {
                                    return (
                                        <View key={index} style={styles.verseSeparator} />
                                    );
                                }

                                // All content lines (no verse headers)
                                return (
                                    <ThemedText
                                        key={index}
                                        style={[
                                            styles.lyricsLine,
                                            { fontSize: getVerseFontSize() },
                                            index === 0 && styles.firstLyricsLine
                                        ]}
                                    >
                                        {line}
                                    </ThemedText>
                                );
                            } catch (renderError) {
                                console.error(`❌ Error rendering line ${index}:`, renderError);
                                return (
                                    <ThemedText
                                        key={index}
                                        style={[
                                            styles.lyricsLine,
                                            { fontSize: getVerseFontSize() },
                                            index === 0 && styles.firstLyricsLine
                                        ]}
                                    >
                                        Error displaying content
                                    </ThemedText>
                                );
                            }
                        })
                    ) : (
                        <ThemedText style={styles.noContentText}>
                            No content available for this hymn.
                        </ThemedText>
                    )}
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.actionButton, isFavorite && styles.favoriteActive]}
                    onPress={() => {
                        console.log('💖 Favorite button pressed:', {
                            isFavorite: isFavorite,
                            favoriteId: favoriteId,
                            hymnId: hymnId
                        });
                        handleFavoritePress();
                    }}
                >
                    <Image
                        source={isFavorite ? Icons.activeLike : Icons.inactiveLike}
                        style={[styles.actionIcon, isFavorite && styles.favoriteIconActive]}
                    />
                    <ThemedText style={[styles.actionText, isFavorite && styles.favoriteTextActive]}>
                        {isFavorite ? 'Favorited' : 'Favorite'}
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleLanguagePress}>
                    <Image source={Icons.browserIcon} style={styles.actionIcon} />
                    <ThemedText style={styles.actionText}>
                        {(() => {
                            const currentLang = availableLanguages?.find((lang: any) => lang.code === currentLanguage);
                            return currentLang?.name || currentLanguage?.toUpperCase() || 'Language';
                        })()}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
        minHeight: scale(60), // Ensure minimum header height
    },
    backButton: {
        padding: scale(8),
        marginRight: scale(12),
        width: scale(40), // Fixed width for back button
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
        paddingHorizontal: scale(8), // Add some padding to prevent text from touching edges
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.darkGrey,
        textAlign: 'center',
        lineHeight: scale(22), // Better line height for multi-line text
    },
    languageIndicator: {
        fontSize: scale(12),
        color: colors.primary,
        fontWeight: '500',
        textAlign: 'center',
    },
    headerSpacer: {
        width: scale(40), // Same width as back button to center the title
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingBottom: scale(100), // Add padding to prevent content from being hidden behind footer
    },
    lyricsContainer: {
        paddingTop: scale(32),
        paddingBottom: scale(24),
        paddingHorizontal: scale(4),
    },
    lyricsLine: {
        color: colors.darkGrey,
        lineHeight: scale(28),
        marginTop: scale(4),
        marginBottom: scale(12),
        textAlign: 'left',
        paddingVertical: scale(2),
    },
    firstLyricsLine: {
        marginTop: scale(8),
        paddingTop: scale(4),
    },
    chorusLabel: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.darkGrey,
        marginTop: scale(20),
        marginBottom: scale(8),
    },
    chorusText: {
        fontSize: scale(16),
        color: colors.darkGrey,
        lineHeight: scale(24),
        marginBottom: scale(12),
    },
    footer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        paddingBottom: scale(20), // Add extra padding for safe area
        backgroundColor: 'transparent',

    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: scale(8),
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
        marginHorizontal: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    favoriteActive: {
        backgroundColor: colors.primary,
    },
    actionIcon: {
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
        marginRight: scale(8),
        tintColor: colors.primary,
    },
    favoriteIconActive: {
        tintColor: colors.white,
    },
    actionText: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.primary,
    },
    favoriteTextActive: {
        color: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(40),
    },
    loadingText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        marginTop: scale(16),
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(40),
    },
    errorText: {
        fontSize: scale(16),
        color: colors.primary,
        textAlign: 'center',
        marginBottom: scale(20),
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        borderRadius: scale(8),
    },
    retryText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: '600',
    },
    noContentText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: scale(20),
    },
    loadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(20),
    },
    loadingContentText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
        marginLeft: scale(8),
    },
    verseSpacing: {
        height: scale(32), // Extra space between verses for better separation
    },
    verseSeparator: {
        height: scale(2),
        backgroundColor: colors.mediumGrey,
        marginVertical: scale(20),
        marginHorizontal: scale(20),
        borderRadius: scale(1),
    },
    verseHeader: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.darkGrey, // Keep same color as regular text
        marginTop: scale(16), // More space after separator
        marginBottom: scale(16), // More space after verse header
        textAlign: 'left', // Left align like regular text
        lineHeight: scale(20), // Better line height for verse headers
    },
});

export default SingleHymnScreen;

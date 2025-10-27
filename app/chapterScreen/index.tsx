import { Icons } from '@/src/assets/icons';
import { DropdownButton } from '@/src/components/DropdownButton';
import { ThemedText } from '@/src/components/themed-text';
import { VerseBottomSheet } from '@/src/components/VerseBottomSheet';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useFontSize } from '@/src/hooks/useFontSize';
import { setSelectedLanguage, setSelectedLanguageInfo } from '@/src/redux/features/userPreferences';
import { callApiMethod } from '@/src/redux/services/callApimethod';
import { useAddToFavoritesMutation, useLazyGetChaptersQuery, useLazyGetVersesQuery, useRemoveFromFavoritesMutation } from '@/src/redux/services/modules/userApi';
import { cleanHtmlContent } from '@/src/utils/htmlUtils';
import { getBestAvailableText } from '@/src/utils/languageUtils';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

interface MultilingualText {
    en?: string;
    sw?: string;
    fr?: string;
    rn?: string;
}

interface Chapter {
    _id: string;
    title: MultilingualText | string;
    content?: MultilingualText | string;
    order: number;
    // Add other fields as per your API response
}

interface Verse {
    _id: string;
    text: MultilingualText | string;
    number: number;
    isFav?: boolean | any; // Favorite state from API response
}

interface ChapterData {
    _id: string;
    title: MultilingualText | string;
    chapters: Chapter[];
    totalChapters: number;
    // Add other fields as per your API response
}

export default function ChapterScreen() {
    const params = useLocalSearchParams();
    const storyId = params.storyId as string;
    const storyTitle = params.storyTitle as string;

    // Get selected language and available languages from Redux persist
    const { selectedLanguage, availableLanguages } = useSelector((state: any) => state.userPreferences);
    const dispatch = useDispatch();
    const currentLanguage = selectedLanguage || 'en';

    // Get font size using custom hook
    const { getVerseFontSize } = useFontSize();







    // API hooks
    const [getChapters, { data, isLoading, error }] = useLazyGetChaptersQuery();
    const [getVerses, { data: versesData, isLoading: versesLoading, error: versesError }] = useLazyGetVersesQuery();

    // Favorite mutations
    const [addToFavorites] = useAddToFavoritesMutation();
    const [removeFromFavorites] = useRemoveFromFavoritesMutation();

    // State for chapters data
    const [chapterData, setChapterData] = useState<ChapterData | null>(null);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<{
        id: string;
        text: string;
        number: number;
    } | null>(null);
    // Remove local state, use Redux persist data directly
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [selectedVerseFilter, setSelectedVerseFilter] = useState<string>('all');
    const [favoriteVerses, setFavoriteVerses] = useState<Set<string>>(new Set());
    const [favoriteIds, setFavoriteIds] = useState<Map<string, string>>(new Map());

    // Helper function to get text in current language and clean HTML
    const getLocalizedText = (text: MultilingualText | string | undefined, fallback: string = ''): string => {
        if (!text) return fallback;

        let extractedText = '';

        if (typeof text === 'string') {
            extractedText = text;
        } else {
            // Dynamic language fallback system
            extractedText = getBestAvailableText(text, currentLanguage, availableLanguages, fallback);
        }

        // Clean HTML content if it contains HTML tags
        if (extractedText && typeof extractedText === 'string') {
            return cleanHtmlContent(extractedText);
        }

        return extractedText;
    };


    // Fetch chapters on component mount
    useEffect(() => {
        if (storyId) {
            console.log('📖 Fetching chapters for storyId:', storyId);
            getChapters(storyId);
        }
    }, [storyId, getChapters]);

    // Handle API response
    useEffect(() => {
        if (data) {
            try {
                const response = data as any;
                console.log('📦 Chapters API Response:', response);

                if (response.success && response.data) {
                    const chapters = response.data || [];
                    const totalChapters = chapters.length;

                    console.log('📖 Total chapters found:', totalChapters);
                    console.log('📖 Chapters data:', chapters);

                    setChapterData({
                        _id: storyId,
                        title: storyTitle,
                        chapters: chapters,
                        totalChapters: totalChapters
                    });

                    setTotalPages(totalChapters);
                    setCurrentPage(totalChapters > 0 ? 1 : 0); // Reset to first chapter or 0 if no chapters
                    setSelectedChapter(totalChapters > 0 ? 1 : 0); // Update selected chapter
                    setSelectedVerseFilter('all'); // Reset to show all verses
                } else {
                    Alert.alert('Error', response.message || 'Failed to load chapters');
                }
            } catch (error) {
                console.error('❌ Error processing chapters data:', error);
                Alert.alert('Error', 'Failed to process chapters data');
            }
        }
    }, [data, storyId, storyTitle]);

    // Handle verses API response
    useEffect(() => {
        if (versesData) {
            try {
                const response = versesData as any;
                console.log('📦 Verses API Response:', response);

                if (response.success && response.data && response.data.verses) {
                    const versesList = Array.isArray(response.data.verses) ? response.data.verses : [];
                    console.log('📖 Verses found:', versesList.length);
                    console.log('📖 Verses data:', versesList);
                    setVerses(versesList);
                    setSelectedVerseFilter('all'); // Reset to show all verses when new verses are loaded
                } else {
                    console.warn('⚠️ No verses found or API error:', response.message);
                    setVerses([]);
                    setSelectedVerseFilter('all'); // Reset to show all verses
                }
            } catch (error) {
                console.error('❌ Error processing verses data:', error);
                setVerses([]);
                setSelectedVerseFilter('all'); // Reset to show all verses
            }
        } else {
            // Ensure verses is always an array when no data
            setVerses([]);
            setSelectedVerseFilter('all'); // Reset to show all verses
        }
    }, [versesData]);

    // Initialize favorite state when verses are loaded
    useEffect(() => {
        if (verses && Array.isArray(verses) && verses.length > 0) {
            console.log('🔄 Initializing favorite state from API response');

            const newFavoriteVerses = new Set<string>();
            const newFavoriteIds = new Map<string, string>();

            verses.forEach((verse: any) => {
                if (verse.isFav) {
                    console.log('❤️ Verse is favorited:', verse._id, verse.isFav);
                    newFavoriteVerses.add(verse._id);
                    if (verse.isFav._id || verse.isFav.id) {
                        newFavoriteIds.set(verse._id, verse.isFav._id || verse.isFav.id);
                    }
                }
            });

            setFavoriteVerses(newFavoriteVerses);
            setFavoriteIds(newFavoriteIds);

            console.log('📊 Favorite state initialized:', {
                favoriteVerses: Array.from(newFavoriteVerses),
                favoriteIds: Object.fromEntries(newFavoriteIds)
            });
        }
    }, [verses]);

    // Get current chapter data based on order
    const currentChapter = chapterData?.chapters?.find(chapter => chapter.order === currentPage);
    const displayTitle = getLocalizedText(chapterData?.title || storyTitle, 'Untitled Story');

    // Fetch verses when current chapter changes
    useEffect(() => {
        if (currentChapter?._id) {
            console.log('📖 Fetching verses for chapterId:', currentChapter._id);
            // Reset verses to empty array before fetching new ones
            setVerses([]);
            setSelectedVerseFilter('all'); // Reset to show all verses
            getVerses(currentChapter._id);
        } else {
            setVerses([]);
            setSelectedVerseFilter('all'); // Reset to show all verses
        }
    }, [currentChapter?._id, getVerses]);

    console.log('📖 Current Chapter Info:', {
        currentPage,
        totalPages,
        currentChapter: currentChapter ? {
            id: currentChapter._id,
            order: currentChapter.order
        } : null,
        verses: verses ? `Array with ${verses.length} items` : 'undefined/null',
        versesType: typeof verses,
        isArray: Array.isArray(verses)
    });

    // Process verses from API data
    const processedVerses = React.useMemo(() => {
        if (!verses || !Array.isArray(verses) || verses.length === 0) return [];

        let filteredVerses = verses;

        // Filter by selected verse if not "all"
        if (selectedVerseFilter !== 'all') {
            filteredVerses = verses.filter((verse: any) => verse._id === selectedVerseFilter);
            console.log('📜 Filtered to specific verse:', filteredVerses.length, 'verses');
        }

        return filteredVerses.map((verse, index) => ({
            id: verse.number || index + 1,
            _id: verse._id, // Keep the unique _id for React keys
            text: getLocalizedText(verse.text, 'No text available'),
            isFav: verse.isFav || false, // Include favorite state from API
            favoriteId: verse.isFav?._id || verse.isFav?.id || null // Include favorite ID if available
        }));
    }, [verses, getLocalizedText, selectedVerseFilter]);

    const handlePrev = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            setSelectedChapter(newPage);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            setSelectedChapter(newPage);
        }
    };


    // Handle verse press to open bottom sheet
    const handleVersePress = (verse: { _id: string; text: string; id: number; isFav: boolean; favoriteId: string | null }) => {
        setSelectedVerse({
            id: verse._id,
            text: verse.text,
            number: verse.id
        });

        // Update favorite state based on API response
        if (verse.isFav && verse.favoriteId) {
            setFavoriteVerses(prev => new Set(prev).add(verse._id));
            setFavoriteIds(prev => {
                const newMap = new Map(prev);
                newMap.set(verse._id, verse.favoriteId!);
                return newMap;
            });
        } else {
            setFavoriteVerses(prev => {
                const newSet = new Set(prev);
                newSet.delete(verse._id);
                return newSet;
            });
            setFavoriteIds(prev => {
                const newMap = new Map(prev);
                newMap.delete(verse._id);
                return newMap;
            });
        }

        setBottomSheetVisible(true);
        console.log('📖 Verse pressed:', verse.id, 'isFav:', verse.isFav, 'favoriteId:', verse.favoriteId);
    };

    // Handle bottom sheet close
    const handleBottomSheetClose = () => {
        setBottomSheetVisible(false);
        setSelectedVerse(null);
    };

    // Language options from Redux persist
    const languageOptions = availableLanguages?.map((lang: any) => ({
        id: lang._id || lang.code,
        label: lang.name || lang.code.toUpperCase(),
        value: lang.code
    })) || [];

    // Chapter options based on total chapters
    const chapterOptions = Array.from({ length: totalPages }, (_, index) => ({
        id: `chapter-${index + 1}`,
        label: `Chapter ${index + 1}`,
        value: (index + 1).toString()
    }));

    // Verse options based on current verses
    const verseOptions = [
        { id: 'all-verses', label: 'All Verses', value: 'all' },
        ...verses.map((verse, index) => ({
            id: `verse-${verse._id}`,
            label: `Verse ${index + 1}`,
            value: verse._id
        }))
    ];

    // Debug: Log chapter options
    console.log('📖 Total chapters:', totalPages);
    console.log('📖 Chapter options:', chapterOptions);
    console.log('📖 Selected chapter:', selectedChapter);

    // Debug: Log verse options
    console.log('📜 Total verses:', verses.length);
    console.log('📜 Verse options:', verseOptions);
    console.log('📜 Selected verse filter:', selectedVerseFilter);

    // Handle language selection
    const handleLanguageSelect = (option: { id: string; label: string; value: string }) => {
        console.log('🌍 Language selected:', option.label, option.value);

        // Update Redux persist with new language selection
        dispatch(setSelectedLanguage(option.value));

        // Find and set the language info
        const selectedLangInfo = availableLanguages?.find((lang: any) => lang.code === option.value);
        if (selectedLangInfo) {
            dispatch(setSelectedLanguageInfo(selectedLangInfo));
        }

        console.log('✅ Language updated in Redux persist:', option.value);
    };

    // Handle chapter selection
    const handleChapterSelect = (option: { id: string; label: string; value: string }) => {
        const chapterNumber = parseInt(option.value);
        console.log('📖 Chapter selected:', option.label, chapterNumber);

        setSelectedChapter(chapterNumber);
        setCurrentPage(chapterNumber);

        console.log('✅ Chapter updated:', chapterNumber);
    };

    // Handle verse selection
    const handleVerseSelect = (option: { id: string; label: string; value: string }) => {
        console.log('📜 Verse selected:', option.label, option.value);

        setSelectedVerseFilter(option.value);

        console.log('✅ Verse filter updated:', option.value);
    };

    // Favorite success handlers
    const onAddFavoriteSuccess = (data: any) => {
        console.log('✅ Successfully added verse to favorites:', data);
        showSuccessToast('Added to favorites!');

        // Store the favorite ID from the response and create isFav object
        if (data?.data?._id && selectedVerse) {
            const favoriteId = data.data._id;
            console.log('📝 Favorite ID stored:', favoriteId);

            // Create isFav object manually for immediate UI update
            const isFavObject = {
                _id: favoriteId,
                id: favoriteId
            };

            // Update the verse in the verses array with isFav
            setVerses(prevVerses => {
                return prevVerses.map(verse => {
                    if (verse._id === selectedVerse.id) {
                        return {
                            ...verse,
                            isFav: isFavObject
                        };
                    }
                    return verse;
                });
            });

            // Update favorite state
            setFavoriteVerses(prev => new Set(prev).add(selectedVerse.id));
            setFavoriteIds(prev => {
                const newMap = new Map(prev);
                newMap.set(selectedVerse.id, favoriteId);
                return newMap;
            });
        }
    };

    const onRemoveFavoriteSuccess = (data: any) => {
        console.log('✅ Successfully removed verse from favorites:', data);
        showSuccessToast('Removed from favorites!');

        // Remove isFav from the verse in the verses array
        if (selectedVerse) {
            setVerses(prevVerses => {
                return prevVerses.map(verse => {
                    if (verse._id === selectedVerse.id) {
                        const { isFav, ...verseWithoutFav } = verse;
                        return verseWithoutFav;
                    }
                    return verse;
                });
            });

            // Update favorite state
            setFavoriteVerses(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedVerse.id);
                return newSet;
            });
            setFavoriteIds(prev => {
                const newMap = new Map(prev);
                newMap.delete(selectedVerse.id);
                return newMap;
            });
        }
    };

    const onFavoriteError = (error: any) => {
        console.error('❌ Error with favorites:', error);
        showErrorToast('Failed to update favorites. Please try again.');
    };

    // Handle verse favorite toggle
    const handleVerseFavorite = async (verseId: string) => {
        try {
            if (!verseId) {
                console.warn('⚠️ No verse ID available for favorites');
                showErrorToast('No verse ID available');
                return;
            }

            const isFavorite = favoriteVerses.has(verseId);
            const favoriteId = favoriteIds.get(verseId);

            console.log('❤️ Toggling favorite for verse:', verseId, 'Is favorite:', isFavorite);

            if (isFavorite && favoriteId) {
                // Remove from favorites
                console.log('💔 Removing verse from favorites:', favoriteId);
                await callApiMethod(removeFromFavorites, onRemoveFavoriteSuccess, onFavoriteError, favoriteId);

                // Update local state
                setFavoriteVerses(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(verseId);
                    return newSet;
                });
                setFavoriteIds(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(verseId);
                    return newMap;
                });
            } else {
                // Add to favorites
                console.log('❤️ Adding verse to favorites:', verseId);
                const payload = {
                    verseId: verseId,
                };
                await callApiMethod(addToFavorites, onAddFavoriteSuccess, onFavoriteError, payload);

                // Update local state
                setFavoriteVerses(prev => new Set(prev).add(verseId));
            }
        } catch (error) {
            console.error('❌ Error handling verse favorite:', error);
            showErrorToast('Failed to update favorites. Please try again.');
        }
    };



    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Image source={Icons.backIcon} style={styles.backIcon} resizeMode='contain' />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
                    <View style={styles.shareButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading chapters...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Image source={Icons.backIcon} style={styles.backIcon} resizeMode='contain' />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Error</ThemedText>
                    <View style={styles.shareButton} />
                </View>
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Failed to load chapters</ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            if (storyId) {
                                getChapters(storyId);
                            }
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
            <TouchableWithoutFeedback onPress={() => { }}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Image source={Icons.backIcon} style={styles.backIcon} resizeMode='contain' />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>{displayTitle}</ThemedText>
                        <TouchableOpacity style={styles.shareButton}>
                            <Image source={Icons.shareIcon} style={styles.shareIcon} resizeMode='contain' />
                        </TouchableOpacity>
                    </View>

                    {/* Header Button Fields */}
                    <View style={styles.headerButtonFields}>
                        <DropdownButton
                            options={languageOptions}
                            selectedValue={selectedLanguage}
                            onSelect={handleLanguageSelect}
                            placeholder="Language"
                        />
                        <DropdownButton
                            options={chapterOptions}
                            selectedValue={selectedChapter.toString()}
                            onSelect={handleChapterSelect}
                            placeholder="Chapter"
                        />
                        <DropdownButton
                            options={verseOptions}
                            selectedValue={selectedVerseFilter}
                            onSelect={handleVerseSelect}
                            placeholder="Verse"
                        />
                    </View>

                    {/* Pagination Bar */}
                    <View style={styles.paginationBar}>
                        <TouchableOpacity
                            style={[styles.paginationButton, (currentPage === 1 || totalPages === 0) && styles.disabledButton]}
                            onPress={handlePrev}
                            disabled={currentPage === 1 || totalPages === 0}
                        >
                            <Image source={Icons.arrowIcon} style={[styles.paginationIcon, { transform: [{ rotate: '180deg' }], marginRight: scale(5) }]} resizeMode='contain' />
                            <ThemedText style={[styles.paginationText, (currentPage === 1 || totalPages === 0) && styles.disabledText]}>Prev</ThemedText>
                        </TouchableOpacity>

                        <View style={styles.pageIndicator}>
                            <ThemedText style={styles.pageText}>
                                {totalPages > 0 ? (currentChapter?.order || currentPage) : 0}/{totalPages}
                            </ThemedText>
                        </View>

                        <TouchableOpacity
                            style={[styles.paginationButton, (currentPage === totalPages || totalPages === 0) && styles.disabledButton]}
                            onPress={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ThemedText style={[styles.paginationText, (currentPage === totalPages || totalPages === 0) && styles.disabledText]}>Next</ThemedText>
                            <Image source={Icons.arrowIcon} style={[styles.paginationIcon, { marginLeft: scale(5) }]} resizeMode='contain' />
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
                        {versesLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <ThemedText style={styles.loadingText}>Loading verses...</ThemedText>
                            </View>
                        ) : versesError ? (
                            <View style={styles.errorContainer}>
                                <ThemedText style={styles.errorText}>Failed to load verses</ThemedText>
                            </View>
                        ) : processedVerses.length > 0 ? (
                            processedVerses.map((verse) => (
                                <TouchableOpacity
                                    key={verse._id}
                                    style={styles.verseContainer}
                                    onPress={() => handleVersePress(verse)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.verseNumber}>
                                        <ThemedText style={styles.verseNumberText}>{verse.id}</ThemedText>
                                    </View>
                                    <View style={styles.verseTextContainer}>
                                        <ThemedText style={[styles.verseText, { fontSize: getVerseFontSize() }]}>{verse.text}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ThemedText style={styles.emptyText}>No verses available for this chapter</ThemedText>
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom Navigation Bar */}
                    {/* <View style={styles.bottomNavBar}>
                        <TouchableOpacity style={styles.bottomNavItem}>
                            <Image source={Icons.heartIcon} style={styles.bottomNavIcon} resizeMode='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bottomNavItem}>
                            <Image source={Icons.browserIcon} style={styles.bottomNavIcon} resizeMode='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bottomNavItem}>
                            <Image source={Icons.copyIcon} style={styles.bottomNavIcon} resizeMode='contain' />
                        </TouchableOpacity>
                    </View> */}

                    {/* Verse Bottom Sheet */}
                    {selectedVerse && (
                        <VerseBottomSheet
                            visible={bottomSheetVisible}
                            onClose={handleBottomSheetClose}
                            verseId={selectedVerse.id}
                            verseText={selectedVerse.text}
                            verseNumber={selectedVerse.number}
                            isLiked={favoriteVerses.has(selectedVerse.id)}
                            onLike={handleVerseFavorite}
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: scale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: scale(20),
        height: scale(20),
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: scale(20),
    },
    shareButton: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareIcon: {
        width: scale(20),
        height: scale(20),
    },
    paginationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: scale(15),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    paginationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: scale(8),
        backgroundColor: colors.lightRed,
        borderRadius: scale(20),
    },
    disabledButton: {
        backgroundColor: '#F0F0F0',
    },
    paginationIcon: {
        width: scale(20),
        height: scale(20),
        tintColor: colors.primary,
    },
    paginationText: {
        fontSize: scale(14),
        // fontWeight: '600',
        color: colors.primary,
    },
    disabledText: {
        color: '#999',
    },
    pageIndicator: {
        paddingHorizontal: scale(20),
    },
    pageText: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#333',
    },
    contentArea: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
    },
    verseContainer: {
        flexDirection: 'row',
        marginBottom: scale(20),
        alignItems: 'flex-start',
        backgroundColor: colors.white,
        borderRadius: scale(8),
        padding: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    verseNumber: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    verseNumberText: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.white,
    },
    verseTextContainer: {
        flex: 1,
        paddingTop: scale(5),
    },
    verseText: {
        fontSize: scale(16),
        lineHeight: scale(24),
        color: '#333',
    },
    bottomNavBar: {
        position: 'absolute',
        bottom: 0,
        // left: 0,
        // right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: scale(10),
        paddingHorizontal: scale(10),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        width: '50%',
        alignSelf: 'center',
        borderRadius: scale(60),
        marginBottom: scale(20),
    },
    bottomNavItem: {
        padding: scale(10),
    },
    bottomNavIcon: {
        width: scale(24),
        height: scale(24),
        tintColor: colors.white,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(40),
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.textGrey,
        textAlign: 'center',
    },
    headerButtonFields: {
        flexDirection: 'row',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        backgroundColor: colors.white,
        // borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
        gap: scale(8),
    },
    buttonField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey2,
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        paddingVertical: scale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonFieldText: {
        fontSize: scale(14),
        color: colors.textGrey,
        fontWeight: '500',
    },
    buttonFieldIcon: {
        width: scale(12),
        height: scale(12),
        tintColor: colors.textGrey,
    },
});
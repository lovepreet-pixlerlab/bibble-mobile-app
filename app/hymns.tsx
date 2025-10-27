import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useLazyGetHymnsQuery } from '@/src/redux/services/modules/userApi';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

interface HymnItem {
    _id: string;
    id: string;
    title: any; // Object with language translations
    description: any; // Object with language translations
    text: any; // Object with language translations for hymn content
    contentType: string;
    type: string;
    status: string;
    freePages: number;
    views: number;
    shares: number;
    userId: string;
    createdAt: string;
}

// Interface for API response (commented out as it's not used directly)
// interface HymnsResponse {
//     success: boolean;
//     data: {
//         hymns: HymnItem[];
//         pagination: {
//             currentPage: number;
//             totalPages: number;
//             totalItems: number;
//             hasNextPage: boolean;
//         };
//     };
//     message: string;
// }

const HymnsScreen = () => {
    // Get selected language from Redux persist
    const { selectedLanguage } = useSelector((state: any) => state.userPreferences);

    // State for hymns data
    const [hymns, setHymns] = useState<HymnItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [contentType] = useState<string>('hymn');
    const [sortBy] = useState<string>('title');
    const [sortOrder] = useState<string>('asc');

    // Ref to track if initial load has been done
    const initialLoadDone = useRef(false);
    // Ref to track search timeout
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Ref to track if load more is in progress
    const isLoadingMoreRef = useRef(false);

    // Lazy query for hymns
    const [getHymns, { isLoading, error }] = useLazyGetHymnsQuery();

    // Fetch hymns function - stable reference
    const fetchHymns = useCallback(async (page: number = 1, search: string = '', reset: boolean = false) => {
        try {
            const params = {
                page: page.toString(),
                limit: '10',
                search: search,
                // contentType: contentType,
                // sortBy: sortBy,
                // sortOrder: sortOrder,
            };

            const response = await getHymns(params).unwrap() as any;


            if (response.success) {
                const newHymns = response.data; // Data is directly an array, not nested under 'hymns'
                const pagination = response.pagination; // Pagination is at root level



                if (reset || page === 1) {
                    setHymns(newHymns);
                } else {
                    setHymns(prev => [...prev, ...newHymns]);
                }

                setCurrentPage(pagination.page);
                setHasNextPage(pagination.hasNextPage);

            } else {
            }
        } catch (error) {
            console.error('❌ Failed to fetch hymns:', error);
        } finally {
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
        }
    }, [getHymns, contentType, sortBy, sortOrder]);

    // Debug: Log loading and error states
    useEffect(() => {
        console.log('🎵 Loading state changed:', isLoading);
        console.log('🎵 Error state:', error);
        console.log('🎵 Hymns count:', hymns.length);
    }, [isLoading, error, hymns.length]);

    // Load initial hymns only once on mount
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            fetchHymns(1, '', true);
        }
    }, []); // Empty dependency array - only run once on mount

    // Search handler with debounce - separate from initial load
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchText === '') {
            return; // Don't refetch if search is empty
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchHymns(1, searchText, true);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]); // Only depend on searchText - remove fetchHymns dependency

    const handleBackPress = () => {
        router.back();
    };

    const handleHymnPress = (hymn: HymnItem) => {

        // Extract title from language object using selected language
        const displayTitle = typeof hymn.title === 'object'
            ? (hymn.title[selectedLanguage] || hymn.title.en || hymn.title.english || Object.values(hymn.title)[0] || 'Untitled')
            : hymn.title;



        const navigationParams = {
            pathname: '/singleHymn',
            params: {
                id: hymn._id,
                title: displayTitle
            }
        };

        console.log('🎵 HymnsScreen - Navigation params:', navigationParams);
        console.log('🎵 HymnsScreen - Navigating to singleHymn with hymnId:', hymn._id);

        router.push(navigationParams);
    };

    // Load more hymns when reaching the end
    const handleLoadMore = () => {
        if (hasNextPage && !isLoadingMore && !isLoading && !isLoadingMoreRef.current) {
            isLoadingMoreRef.current = true;
            setIsLoadingMore(true);
            fetchHymns(currentPage + 1, searchText, false);
        }
    };

    // Handle search text change
    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const renderHymnItem = ({ item }: { item: HymnItem }) => {
        console.log('🎵 HymnsScreen - Rendering hymn item:', item);

        // Extract title from language object using selected language
        const displayTitle = typeof item.title === 'object'
            ? (item.title[selectedLanguage] || item.title.en || item.title.english || Object.values(item.title)[0] || 'Untitled')
            : item.title;

        console.log('🎵 HymnsScreen - Render display title:', displayTitle);

        return (
            <TouchableOpacity
                style={styles.hymnItem}
                onPress={() => {
                    console.log('🎵 HymnsScreen - Hymn item pressed:', item._id);
                    handleHymnPress(item);
                }}
            >
                <ThemedText style={styles.hymnTitle}>{displayTitle}</ThemedText>
                <Image source={Icons.arrowIcon} style={styles.arrowIcon} />
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading more hymns...</ThemedText>
                </View>
            );
        }
        return null;
    };

    const renderEmptyState = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <ThemedText style={styles.emptyText}>Loading hymns...</ThemedText>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyState}>
                    <ThemedText style={styles.errorText}>Failed to load hymns</ThemedText>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchHymns(1, searchText, true)}>
                        <ThemedText style={styles.retryText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            );
        }

        if (hymns.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>
                        {searchText ? 'No hymns found matching your search' : 'No hymns available'}
                    </ThemedText>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Image source={Icons.backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Hymns</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            {/* Search Bar */}
            {/* <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search hymns..."
                    placeholderTextColor={colors.textGrey}
                    value={searchText}
                    onChangeText={handleSearchChange}
                />
            </View> */}

            {/* Hymns List */}
            <FlatList
                data={hymns}
                renderItem={renderHymnItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                // ListFooterComponent={renderFooter}
                // ListEmptyComponent={renderEmptyState}
                // onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
            />
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
    },
    backIcon: {
        width: scale(24),
        height: scale(24),
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.darkGrey,
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: scale(40), // Same width as back button to center the title
    },
    searchContainer: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
    },
    searchInput: {
        backgroundColor: colors.lightGrey2,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        fontSize: scale(16),
        color: colors.darkGrey,
    },
    list: {
        flex: 1,
    },
    hymnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        backgroundColor: colors.white,
    },
    hymnTitle: {
        fontSize: scale(16),
        color: colors.darkGrey,
        fontWeight: '600',
        flex: 1,
    },
    arrowIcon: {
        width: scale(16),
        height: scale(16),
        resizeMode: 'contain',
        tintColor: colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.lightGrey2,
        marginLeft: scale(20),
    },
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(20),
    },
    loadingText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
        marginLeft: scale(8),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(40),
    },
    emptyText: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        textAlign: 'center',
        marginTop: scale(16),
    },
    errorText: {
        fontSize: scale(16),
        color: colors.primary,
        textAlign: 'center',
        marginBottom: scale(16),
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
});

export default HymnsScreen;

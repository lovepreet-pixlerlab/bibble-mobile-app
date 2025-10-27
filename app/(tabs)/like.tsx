import FavoritesItem from '@/src/components/FavoritesItem';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useLazyGetFavoritesQuery } from '@/src/redux/services/modules/userApi';
import { cleanHtmlContent } from '@/src/utils/htmlUtils';
import { getBestAvailableText } from '@/src/utils/languageUtils';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

interface HymnData {
  _id: string;
  productId: {
    _id: string;
    type: string;
    title: Record<string, string>;
    id: string;
  };
  number: number;
  text: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface VerseData {
  _id: string;
  chapterId: {
    _id: string;
    storyId: {
      _id: string;
      productId: {
        _id: string;
        type: string;
        contentType: string;
        freePages: number;
        title: Record<string, string>;
        views: number;
        shares: number;
        id: string;
      };
      title: Record<string, string>;
      description: Record<string, string>;
      order: number;
      createdAt: string;
      updatedAt: string;
      __v: number;
      id: string;
    };
    title: Record<string, string>;
    order: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
  number: number;
  text: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface FavoriteItem {
  _id: string;
  userId: string;
  hymnId?: HymnData;
  verseId?: VerseData;
  notes: string | null;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface FavoritesResponse {
  success: boolean;
  data: {
    data: FavoriteItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
      limit: number;
    };
  };
}

export default function LikeScreen() {
  const [getFavorites, { data, isLoading }] = useLazyGetFavoritesQuery();

  // Get selected language and available languages from Redux persist
  const { selectedLanguage, availableLanguages } = useSelector((state: any) => state.userPreferences);

  // Ensure selectedLanguage is a valid key based on available languages from backend
  const validLanguage = (selectedLanguage && availableLanguages &&
    availableLanguages.some((lang: any) => lang.code === selectedLanguage))
    ? selectedLanguage
    : (availableLanguages && availableLanguages.length > 0
      ? (availableLanguages.find((lang: any) => lang.isDefault)?.code || availableLanguages[0]?.code || 'en')
      : 'en');

  // Helper function to get localized text with HTML cleaning
  const getLocalizedText = (text: any, fallback: string = 'No text available'): string => {
    let extractedText = '';

    if (typeof text === 'string') {
      extractedText = text;
    } else {
      // Dynamic language fallback system
      extractedText = getBestAvailableText(text, validLanguage, availableLanguages, fallback);
    }

    if (extractedText && typeof extractedText === 'string') {
      const cleanedText = cleanHtmlContent(extractedText);
      return cleanedText;
    }

    return extractedText;
  };

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const initialLoadRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const retryCountRef = useRef(0);

  const limit = 20; // Items per page

  // Fetch favorites data
  const fetchFavorites = useCallback(async (page: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page > 1) {
        setIsLoadingMore(true);
        isLoadingMoreRef.current = true;
      }

      const payload = {
        page: page,
        limit: limit,
      };

      await getFavorites(payload);
      lastFetchTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [getFavorites]);

  // Handle API response
  useEffect(() => {
    if (data) {
      try {
        const response = data as FavoritesResponse;

        if (response.success && response.data && Array.isArray(response.data.data)) {
          const newFavorites: FavoriteItem[] = response.data.data.map((item: any) => ({
            _id: item._id,
            userId: item.userId,
            hymnId: item.hymnId || undefined,
            verseId: item.verseId || undefined,
            notes: item.notes,
            addedAt: item.addedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            __v: item.__v,
            id: item.id,
          }));

          if (currentPage === 1) {
            setFavorites(newFavorites);
          } else {
            setFavorites(prev => [...prev, ...newFavorites]);
          }

          setTotalPages(response.data.pagination?.totalPages || 1);
          setHasMoreData(currentPage < (response.data.pagination?.totalPages || 1));
        } else {
          console.log('No favorites data found');
          if (currentPage === 1) {
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error('Error processing favorites data:', error);
        if (currentPage === 1) {
          setFavorites([]);
        }
      }
    }
  }, [data, currentPage]);

  // Initial load with retry mechanism
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      setCurrentPage(1);
      setHasMoreData(true);
      fetchFavorites(1);
    }
  }, [fetchFavorites]);

  // Retry mechanism for initial load if no data after 3 seconds
  useEffect(() => {
    if (initialLoadRef.current && favorites.length === 0 && !isLoading && retryCountRef.current < 2) {
      const timer = setTimeout(() => {
        retryCountRef.current += 1;
        setCurrentPage(1);
        setHasMoreData(true);
        fetchFavorites(1);
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [favorites.length, isLoading, fetchFavorites]);

  // Auto-fetch when screen comes into focus (but not on initial load)
  useFocusEffect(
    useCallback(() => {
      // Skip if this is the initial load (handled by useEffect above)
      if (!initialLoadRef.current) {
        return;
      }

      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      const REFRESH_THRESHOLD = 30000; // 30 seconds

      // Only fetch if it's been more than 30 seconds since last fetch
      if (timeSinceLastFetch > REFRESH_THRESHOLD) {
        setCurrentPage(1);
        setHasMoreData(true);
        fetchFavorites(1);
      }
    }, [fetchFavorites])
  );

  // Handle loading states
  useEffect(() => {
    if (isLoading && currentPage === 1 && !isRefreshing) {
      // Initial loading
    } else if (isLoading && currentPage > 1) {
      // Loading more
    } else {
      setIsLoadingMore(false);
      setIsRefreshing(false);
      isLoadingMoreRef.current = false;
    }
  }, [isLoading, currentPage, isRefreshing]);

  // Load more data
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreData && !isLoadingMoreRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchFavorites(nextPage);
    }
  }, [isLoadingMore, hasMoreData, currentPage, fetchFavorites]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchFavorites(1, true);
  }, [fetchFavorites]);

  // Handle item press
  const handleItemPress = useCallback((item: FavoriteItem) => {
    if (item.hymnId) {
      // Navigate to single hymn screen with productId
      const title = getLocalizedText(item.hymnId.productId?.title, 'Unknown Hymn');
      const productId = item.hymnId.productId._id;

      const navigationParams = {
        pathname: '/singleHymn',
        params: {
          hymnId: productId,  // Use productId._id instead of hymnId._id
          hymnTitle: title
        }
      };

      router.push(navigationParams);
    } else if (item.verseId) {
      // Navigate to chapter screen with verse context
      const storyTitle = getLocalizedText(item.verseId.chapterId.storyId.title, 'Story');
      const chapterTitle = getLocalizedText(item.verseId.chapterId.title, 'Chapter');

      router.push({
        pathname: '/chapterScreen',
        params: {
          storyId: item.verseId.chapterId.storyId._id,
          storyTitle: storyTitle,
          chapterId: item.verseId.chapterId._id,
          chapterTitle: chapterTitle,
          verseId: item.verseId._id,
          verseNumber: item.verseId.number.toString(),
        },
      });
    } else {
      console.log('Unknown favorite type - no hymnId or verseId found');
    }
  }, [validLanguage]);

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading more favorites...</ThemedText>
        </View>
      );
    }
    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading && currentPage === 1) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.emptyText}>Loading favorites...</ThemedText>
        </View>
      );
    }

    if (favorites.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No favorites found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Start adding items to your favorites to see them here
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
        <ThemedText style={styles.headerTitle}>Favorites</ThemedText>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          if (item.hymnId) {
            // Hymn favorite - Use singleHymn.tsx design
            const hymnTitle = getLocalizedText(item.hymnId.productId?.title, 'Unknown Hymn');
            const verseText = getLocalizedText(item.hymnId.text, '');

            return (
              <View style={styles.hymnFavoriteContainer}>
                <TouchableOpacity
                  style={styles.hymnFavoriteItem}
                  onPress={() => handleItemPress(item)}
                >
                  {/* Header with title */}
                  <View style={styles.hymnFavoriteHeader}>
                    <ThemedText style={styles.hymnFavoriteTitle}>{hymnTitle}</ThemedText>
                    <ThemedText style={styles.hymnFavoriteSubtitle}>Hymn • Verse {item.hymnId.number}</ThemedText>
                  </View>

                  {/* Content using singleHymn.tsx lyrics design */}
                  <View style={styles.hymnLyricsContainer}>
                    {verseText && (
                      <ThemedText style={styles.hymnLyricsLine}>
                        {verseText}
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          } else if (item.verseId) {
            // Verse favorite - Use chapterScreen design
            const storyTitle = getLocalizedText(item.verseId.chapterId.storyId.title, 'Story');
            const chapterTitle = getLocalizedText(item.verseId.chapterId.title, 'Chapter');
            const verseText = getLocalizedText(item.verseId.text, '');

            return (
              <View style={styles.verseFavoriteContainer}>
                <TouchableOpacity
                  style={styles.verseFavoriteItem}
                  onPress={() => handleItemPress(item)}
                >
                  {/* Header with story and chapter info */}
                  <View style={styles.verseFavoriteHeader}>
                    <ThemedText style={styles.verseFavoriteTitle}>{storyTitle}</ThemedText>
                    <ThemedText style={styles.verseFavoriteSubtitle}>{chapterTitle}</ThemedText>
                  </View>

                  {/* Verse content using chapterScreen design */}
                  <View style={styles.verseContainer}>
                    <View style={styles.verseNumber}>
                      <ThemedText style={styles.verseNumberText}>{item.verseId.number}</ThemedText>
                    </View>
                    <View style={styles.verseTextContainer}>
                      <ThemedText style={styles.verseText}>{verseText}</ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          } else {
            // Fallback for unknown types
            return (
              <FavoritesItem
                id={parseInt(item._id) || 0}
                title="Unknown Item"
                subtitle=""
                isHighlighted={false}
                onPress={() => handleItemPress(item)}
              />
            );
          }
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoadingIndicator}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(20),
  },
  loadingText: {
    marginLeft: scale(10),
    fontSize: scale(14),
    color: colors.mediumGrey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(60),
    paddingHorizontal: scale(40),
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.darkGrey,
    textAlign: 'center',
    marginBottom: scale(8),
  },
  emptySubtext: {
    fontSize: scale(14),
    color: colors.mediumGrey,
    textAlign: 'center',
    lineHeight: scale(20),
  },
  // Hymn Favorite Styles - Based on singleHymn.tsx
  hymnFavoriteContainer: {
    marginHorizontal: scale(20),
    marginVertical: scale(6),
  },
  hymnFavoriteItem: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hymnFavoriteHeader: {
    marginBottom: scale(16),
  },
  hymnFavoriteTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.darkGrey,
    marginBottom: scale(4),
  },
  hymnFavoriteSubtitle: {
    fontSize: scale(12),
    color: colors.primary,
    fontWeight: '600',
  },
  hymnLyricsContainer: {
    paddingTop: scale(8),
    paddingBottom: scale(8),
    paddingHorizontal: scale(4),
  },
  hymnLyricsLine: {
    color: colors.darkGrey,
    lineHeight: scale(28),
    marginTop: scale(4),
    marginBottom: scale(12),
    textAlign: 'left',
    paddingVertical: scale(2),
    fontSize: scale(16),
  },
  // Verse Favorite Styles - Based on chapterScreen
  verseFavoriteContainer: {
    marginHorizontal: scale(20),
    marginVertical: scale(6),
  },
  verseFavoriteItem: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseFavoriteHeader: {
    marginBottom: scale(12),
  },
  verseFavoriteTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.darkGrey,
    marginBottom: scale(4),
  },
  verseFavoriteSubtitle: {
    fontSize: scale(12),
    color: colors.primary,
    fontWeight: '600',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: scale(8),
    padding: scale(12),
    marginTop: scale(8),
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
});
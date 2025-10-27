import { Icons } from '@/src/assets/icons';
import HistoryItem from '@/src/components/HistoryItem';
import SearchInput from '@/src/components/SearchInput';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { addToSearchHistory, clearSearchHistory, removeFromSearchHistory } from '@/src/redux/features/userPreferences';
import { useLazySearchContentQuery } from '@/src/redux/services/modules/userApi';
import { cleanHtmlContent } from '@/src/utils/htmlUtils';
import { getBestAvailableText } from '@/src/utils/languageUtils';
import { useRouter } from 'expo-router';
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

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedLanguage, availableLanguages, searchHistory } = useSelector((state: any) => state.userPreferences);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Search API hook
  const [getSearch, { data: searchData, error: searchError, isLoading: searchLoading }] = useLazySearchContentQuery();

  // Helper function to get localized text
  const getLocalizedText = (text: any, fallback: string = ''): string => {
    if (!text) return fallback;
    let extractedText = '';
    if (typeof text === 'string') {
      extractedText = text;
    } else {
      extractedText = getBestAvailableText(text, selectedLanguage, availableLanguages, fallback);
    }
    if (extractedText && typeof extractedText === 'string') {
      const cleanedText = cleanHtmlContent(extractedText);
      return cleanedText;
    }
    return extractedText;
  };


  const performSearch = (query: string, type: string, page: number) => {
    // Don't search if query is too short
    if (!query || query.trim().length < 2) {
      console.log('🚫 Search query too short, skipping API call');
      return;
    }

    setIsSearching(true);

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const searchParams = {
      query: query,
      type: type.toLowerCase(),
      limit: 20,
      page: page
    };

    console.log('🔍 Searching with params:', searchParams);
    getSearch(searchParams);

    // Set a timeout to prevent infinite loading (10 seconds)
    const timeout = setTimeout(() => {
      console.warn('⏰ Search timeout - stopping loader');
      setIsSearching(false);
    }, 10000);

    setSearchTimeout(timeout);
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchText(item);
  };

  const handleRemoveHistoryItem = (itemToRemove: string) => {
    dispatch(removeFromSearchHistory(itemToRemove));
  };

  const handleClearAll = () => {
    dispatch(clearSearchHistory());
  };

  // Navigation handlers for different result types
  const handleVersePress = (verse: any) => {
    // Save current search term to Redux persist (only if meaningful)
    const trimmedSearch = searchText.trim();
    if (trimmedSearch && trimmedSearch.length >= 2) {
      dispatch(addToSearchHistory(trimmedSearch));
    }

    // Navigate to chapter screen with verse context
    router.push({
      pathname: '/chapterScreen',
      params: {
        storyId: verse.story._id,
        storyTitle: getLocalizedText(verse.story.title, 'Story'),
        chapterId: verse.chapter._id,
        chapterTitle: getLocalizedText(verse.chapter.title, 'Chapter'),
        verseId: verse._id,
        verseNumber: verse.number
      }
    });
  };

  const handleHymnPress = (hymn: any) => {
    // Save current search term to Redux persist (only if meaningful)
    const trimmedSearch = searchText.trim();
    if (trimmedSearch && trimmedSearch.length >= 2) {
      dispatch(addToSearchHistory(trimmedSearch));
    }

    // Navigate to single hymn screen
    router.push({
      pathname: '/singleHymn',
      params: {
        hymnId: hymn._id,
        hymnTitle: getLocalizedText(hymn.product.title, 'Hymn')
      }
    });
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);

    // Only perform search if we have meaningful search text
    if (searchText.trim() && searchText.trim().length >= 2) {
      // Clear any existing debounce timer to prevent conflicts
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      setCurrentPage(1);
      setSearchResults([]);
      setHasMoreData(true);
      performSearch(searchText.trim(), filter, 1);
    }
  };

  // Handle search data response and errors
  useEffect(() => {
    if (searchData) {
      console.log('📦 Search API Response:', searchData);

      // Clear timeout since we got a response
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }

      if (searchData.success && searchData.data) {
        const newResults = searchData.data.results || [];
        const pagination = searchData.data.pagination || {};

        if (currentPage === 1) {
          // First page - replace results
          setSearchResults(newResults);
        } else {
          // Subsequent pages - append results
          setSearchResults(prev => [...prev, ...newResults]);
        }

        // Check if there's more data
        setHasMoreData(pagination.hasNextPage || false);
      } else {
        // No results found
        if (currentPage === 1) {
          setSearchResults([]);
        }
        setHasMoreData(false);
      }

      setIsSearching(false);
    }
  }, [searchData, currentPage, searchTimeout]);

  // Handle search errors
  useEffect(() => {
    if (searchError) {
      console.error('❌ Search API Error:', searchError);

      // Clear timeout since we got an error
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }

      setIsSearching(false);
      setSearchResults([]);
      setHasMoreData(false);
    }
  }, [searchError, searchTimeout]);

  // Handle loading state from API
  useEffect(() => {
    if (searchLoading !== undefined) {
      setIsSearching(searchLoading);
    }
  }, [searchLoading]);

  // Handle search text changes - Auto search when 2+ characters with debounce
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchText.length < 2) {
      // Clear results when search text is too short
      setSearchResults([]);
      setCurrentPage(1);
      setHasMoreData(true);
    } else if (searchText.length >= 2) {
      // Debounced search - wait 500ms after user stops typing
      const timer = setTimeout(() => {
        const trimmedSearch = searchText.trim();
        // Note: Search text is now saved to history only when user clicks on results

        setCurrentPage(1);
        setSearchResults([]);
        setHasMoreData(true);
        performSearch(trimmedSearch, selectedFilter, 1);
      }, 500);

      setDebounceTimer(timer);
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchText]); // Removed selectedFilter dependency to prevent unnecessary searches

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [debounceTimer, searchTimeout]);

  // Verse Result Component (Chapter Screen Design)
  const VerseResultItem = ({ verse }: { verse: any }) => (
    <TouchableOpacity
      style={styles.verseResultItem}
      onPress={() => handleVersePress(verse)}
    >
      <View style={styles.verseHeader}>
        <ThemedText style={styles.verseNumber}>Verse {verse.number}</ThemedText>
        <ThemedText style={styles.verseType}>Bible</ThemedText>
      </View>

      <ThemedText style={styles.verseText} numberOfLines={3}>
        {getLocalizedText(verse.text, 'No text available')}
      </ThemedText>

      <View style={styles.verseContext}>
        <ThemedText style={styles.verseContextText}>
          {getLocalizedText(verse.story.title, 'Story')} • {getLocalizedText(verse.chapter.title, 'Chapter')}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  // Hymn Result Component (Inspired Screen Design)
  const HymnResultItem = ({ hymn }: { hymn: any }) => (
    <TouchableOpacity
      style={styles.hymnResultItem}
      onPress={() => handleHymnPress(hymn)}
    >
      <View style={styles.hymnHeader}>
        <ThemedText style={styles.hymnTitle}>
          {getLocalizedText(hymn.product.title, 'Hymn')}
        </ThemedText>
        <ThemedText style={styles.hymnType}>Hymn</ThemedText>
      </View>

      <ThemedText style={styles.hymnText} numberOfLines={3}>
        {getLocalizedText(hymn.text, 'No text available')}
      </ThemedText>

      <View style={styles.hymnFooter}>
        <View style={styles.hymnIconContainer}>
          <Image source={Icons.rythemIcon} style={styles.hymnIcon} />
        </View>
        <ThemedText style={styles.hymnFooterText}>
          Verse {hymn.number}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <SearchInput
          placeholder="Search hymns or Bible..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'All' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('All')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'All' && styles.filterTextActive]}>
              All
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'Hymns' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('Hymns')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'Hymns' && styles.filterTextActive]}>
              Hymns
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'Bible' && styles.filterButtonActive]}
            onPress={() => handleFilterSelect('Bible')}
          >
            <ThemedText style={[styles.filterText, selectedFilter === 'Bible' && styles.filterTextActive]}>
              Bible
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Show search results or history based on search text length */}
        {searchText.length >= 2 ? (
          // Show search results
          <View style={styles.resultsSection}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={styles.loadingText}>Searching...</ThemedText>
              </View>
            ) : searchResults.length > 0 ? (
              <View style={styles.resultsList}>
                <ThemedText style={styles.resultsTitle}>
                  Search Results ({searchResults.length})
                </ThemedText>
                {searchResults.map((item, index) => (
                  <View key={index}>
                    {item.type === 'verse' ? (
                      <VerseResultItem verse={item} />
                    ) : item.type === 'hymn' ? (
                      <HymnResultItem hymn={item} />
                    ) : (
                      <TouchableOpacity style={styles.resultItem}>
                        <ThemedText style={styles.resultTitle}>{item.title || item.name}</ThemedText>
                        <ThemedText style={styles.resultSubtitle}>{item.type || 'Content'}</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {hasMoreData && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      performSearch(searchText.trim(), selectedFilter, nextPage);
                    }}
                  >
                    <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No results found</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Try adjusting your search terms or filters
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          // Show history when search text is less than 2 characters
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <ThemedText style={styles.historyTitle}>History</ThemedText>
              {searchHistory.length > 0 && (
                <TouchableOpacity onPress={handleClearAll}>
                  <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {searchHistory.length > 0 ? (
              <View style={styles.historyList}>
                {searchHistory.map((item: string, index: number) => (
                  <HistoryItem
                    key={index}
                    text={item}
                    onPress={() => handleHistoryItemPress(item)}
                    onRemove={() => handleRemoveHistoryItem(item)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <ThemedText style={styles.emptyHistoryText}>No search history found</ThemedText>
                <ThemedText style={styles.emptyHistorySubtext}>
                  Start typing to search and your searches will appear here
                </ThemedText>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    marginTop: scale(15),
    gap: scale(10),
  },
  filterButton: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#F5E6E6',
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  historySection: {
    paddingHorizontal: scale(20),
    marginTop: scale(20),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  historyTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllText: {
    fontSize: scale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  historyList: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    paddingHorizontal: scale(15),
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingVertical: scale(40),
    paddingHorizontal: scale(20),
  },
  emptyHistoryText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#666',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  emptyHistorySubtext: {
    fontSize: scale(14),
    color: colors.textGrey,
    textAlign: 'center',
    lineHeight: scale(20),
  },
  resultsSection: {
    paddingHorizontal: scale(20),
    marginTop: scale(20),
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.primary,
    marginTop: scale(10),
  },
  resultsList: {
    backgroundColor: colors.white,
  },
  resultsTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(15),
  },
  resultItem: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    padding: scale(15),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(5),
  },
  resultSubtitle: {
    fontSize: scale(14),
    color: colors.textGrey,
  },
  loadMoreButton: {
    backgroundColor: colors.primary,
    borderRadius: scale(8),
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    marginTop: scale(20),
  },
  loadMoreText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  emptyText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#666',
    marginBottom: scale(10),
  },
  emptySubtext: {
    fontSize: scale(14),
    color: colors.textGrey,
    textAlign: 'center',
  },
  // Verse Result Styles (Chapter Screen Design)
  verseResultItem: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  verseNumber: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.primary,
  },
  verseType: {
    fontSize: scale(12),
    color: colors.textGrey,
    backgroundColor: colors.lightGrey,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  verseText: {
    fontSize: scale(16),
    lineHeight: scale(22),
    color: '#333',
    marginBottom: scale(8),
  },
  verseContext: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: scale(8),
  },
  verseContextText: {
    fontSize: scale(12),
    color: colors.textGrey,
  },
  // Hymn Result Styles (Inspired Screen Design)
  hymnResultItem: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hymnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  hymnTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
    marginRight: scale(8),
  },
  hymnType: {
    fontSize: scale(12),
    color: colors.textGrey,
    backgroundColor: colors.lightGrey,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  hymnText: {
    fontSize: scale(14),
    lineHeight: scale(20),
    color: '#333',
    marginBottom: scale(12),
  },
  hymnFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: scale(8),
  },
  hymnIconContainer: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  hymnIcon: {
    width: scale(12),
    height: scale(12),
    tintColor: colors.white,
  },
  hymnFooterText: {
    fontSize: scale(12),
    color: colors.textGrey,
  },
});
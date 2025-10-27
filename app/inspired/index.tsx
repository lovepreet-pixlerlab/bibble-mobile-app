import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useLazyGetStoriesQuery } from '@/src/redux/services/modules/userApi';
import { cleanHtmlContent } from '@/src/utils/htmlUtils';
import { getBestAvailableText } from '@/src/utils/languageUtils';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

interface MultilingualText {
    en?: string;
    sw?: string;
    fr?: string;
    rn?: string;
}

interface Story {
    _id: string;
    title: MultilingualText | string;
    subtitle?: MultilingualText | string;
    description?: MultilingualText | string;
    type?: 'old' | 'new';
    // Add other fields as per your API response
}

export default function InspiredScreen() {
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get selected language and available languages from Redux persist
    const { selectedLanguage, availableLanguages } = useSelector((state: any) => state.userPreferences);
    const currentLanguage = selectedLanguage || 'en';

    // API hook
    const [getStories, { isLoading: apiLoading, error }] = useLazyGetStoriesQuery();

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
            const cleanedText = cleanHtmlContent(extractedText);
            return cleanedText;
        }

        return extractedText;
    };


    // Fetch stories on component mount
    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            setIsLoading(true);
            const result = await getStories({}).unwrap();
            if (result.success && result.data) {
                setStories(result.data);
            } else {
                Alert.alert('Error', result.message || 'Failed to fetch stories');
            }
        } catch (err) {
            console.error('Error fetching stories:', err);
            Alert.alert('Error', 'Failed to fetch stories');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter stories based on active tab
    const currentItems = stories.filter(story => {
        if (activeTab === 'old') {
            return story.type === 'old' || !story.type; // Default to old if no type specified
        } else {
            return story.type === 'new';
        }
    });

    const handleStoryPress = (story: Story) => {
        // Navigate to chapter screen with story data
        router.push({
            pathname: '/chapterScreen',
            params: {
                storyId: story._id,
                storyTitle: getLocalizedText(story.title, 'Untitled Story')
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Image source={Icons.backIcon} style={styles.backIcon} resizeMode='contain' />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Be Inspired</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentedContainer}>
                <TouchableOpacity
                    style={[styles.segmentButton, activeTab === 'old' && styles.activeSegment]}
                    onPress={() => setActiveTab('old')}
                >
                    <ThemedText style={[styles.segmentText, activeTab === 'old' && styles.activeSegmentText]}>
                        Old Testament
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segmentButton, activeTab === 'new' && styles.activeSegment]}
                    onPress={() => setActiveTab('new')}
                >
                    <ThemedText style={[styles.segmentText, activeTab === 'new' && styles.activeSegmentText]}>
                        New Testament
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Content List */}
            <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
                {isLoading || apiLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <ThemedText style={styles.loadingText}>Loading stories...</ThemedText>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>Failed to load stories</ThemedText>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
                            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : currentItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>No stories available</ThemedText>
                    </View>
                ) : (
                    currentItems.map((story) => (
                        <TouchableOpacity
                            key={story._id}
                            onPress={() => handleStoryPress(story)}
                            style={styles.listItem}
                        >
                            <View style={styles.itemContent}>
                                <ThemedText style={styles.itemTitle}>
                                    {getLocalizedText(story.title, 'Untitled Story')}
                                </ThemedText>
                                <ThemedText style={styles.itemSubtitle}>
                                    {getLocalizedText(story.subtitle || story.description, 'Tap to read more')}
                                </ThemedText>
                            </View>
                            <View style={styles.arrowContainer}>
                                <Image source={Icons.arrowIcon} style={styles.arrowIcon} resizeMode='contain' />
                            </View>
                        </TouchableOpacity>
                    ))
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
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
        resizeMode: 'contain',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    headerSpacer: {
        width: scale(40),
    },
    segmentedContainer: {
        flexDirection: 'row',
        marginHorizontal: scale(20),
        marginVertical: scale(20),
        backgroundColor: colors.lightRed,
        borderRadius: scale(60),
        padding: scale(4),
    },
    segmentButton: {
        flex: 1,
        paddingVertical: scale(12),
        paddingHorizontal: scale(20),
        borderRadius: scale(60),
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSegment: {
        backgroundColor: colors.primary,
    },
    segmentText: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    activeSegmentText: {
        color: colors.white,
    },
    contentList: {
        flex: 1,
        paddingHorizontal: scale(20),
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingVertical: scale(15),
        paddingHorizontal: scale(15),
        marginBottom: scale(8),
        borderRadius: scale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: scale(4),
    },
    itemSubtitle: {
        color: '#666',
    },
    arrowContainer: {
        width: scale(30),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(50),
    },
    loadingText: {
        marginTop: scale(10),
        color: colors.primary,
        fontSize: scale(16),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(50),
    },
    errorText: {
        color: colors.primary,
        fontSize: scale(16),
        marginBottom: scale(20),
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        borderRadius: scale(8),
    },
    retryButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: scale(50),
    },
    emptyText: {
        color: colors.textGrey,
        fontSize: scale(16),
        textAlign: 'center',
    },
});
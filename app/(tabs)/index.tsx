import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setAvailableLanguages, setSelectedLanguage, setSelectedLanguageInfo } from '@/src/redux/features/userPreferences';
import { useLazyGetLanguagesQuery } from '@/src/redux/services/modules/userApi';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');

  // Get current language state from Redux
  const { selectedLanguage } = useSelector((state: any) => state.userPreferences);

  // Use lazy query to fetch languages
  const [getLanguages, { data: response }] = useLazyGetLanguagesQuery();

  // Extract languages from nested response
  const apiLanguages = (response as any)?.data || [];

  // Fetch languages on component mount
  React.useEffect(() => {
    getLanguages(undefined);
  }, [getLanguages]);

  // Save languages to Redux when API data is available
  React.useEffect(() => {
    if (apiLanguages.length > 0) {
      dispatch(setAvailableLanguages(apiLanguages));

      // Check if current selectedLanguage exists in available languages
      const currentLanguageExists = apiLanguages.some((lang: any) => lang.code === selectedLanguage);

      if (!currentLanguageExists) {

        // Find English language in available languages
        const englishLanguage = apiLanguages.find((lang: any) =>
          lang.code === 'en' ||
          lang.name?.toLowerCase().includes('english') ||
          lang.name?.toLowerCase().includes('inglés')
        );

        if (englishLanguage) {
          dispatch(setSelectedLanguage(englishLanguage.code));
          dispatch(setSelectedLanguageInfo(englishLanguage));
        } else {
          // If English not found, use the first available language
          const defaultLanguage = apiLanguages[0];
          dispatch(setSelectedLanguage(defaultLanguage.code));
          dispatch(setSelectedLanguageInfo(defaultLanguage));
        }
      } else {
        console.log('✅ Current selected language is valid:', selectedLanguage);
      }
    }
  }, [apiLanguages, dispatch, selectedLanguage]);

  const handleHymnsPress = () => {
    router.push('/hymns');
  };

  const handleBiblePress = () => {
    router.push('/inspired');
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Tenzi n'Indirimbo za Yesu</ThemedText>
        <TouchableOpacity style={styles.searchIconButton} onPress={handleSearchPress}>
          <Image source={Icons.activeSearch} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.textGrey}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Hymns Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleHymnsPress}>
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Image source={Icons.rythemIcon} style={styles.musicIcon} />
            </View>
            <ThemedText style={styles.buttonText}>Hymns</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Bible Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleBiblePress}>
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Image source={Icons.bibbleOutlineIcon} style={styles.bibleIcon} />
            </View>
            <ThemedText style={styles.buttonText}>Bible</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.darkGrey,
    flex: 1,
  },
  searchIconButton: {
    padding: scale(8),
  },
  searchIcon: {
    width: scale(24),
    height: scale(24),
    resizeMode: 'contain',
  },
  searchContainer: {
    paddingHorizontal: scale(20),
    marginBottom: scale(40),
  },
  searchInput: {
    backgroundColor: colors.lightGrey2,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(16),
    color: colors.darkGrey,
  },
  actionsContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: scale(12),
    marginBottom: scale(20),
    height: scale(80),
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: scale(16),
  },
  musicIcon: {
    width: scale(24),
    height: scale(24),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  bibleIcon: {
    width: scale(24),
    height: scale(24),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  buttonText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.white,
  },
});

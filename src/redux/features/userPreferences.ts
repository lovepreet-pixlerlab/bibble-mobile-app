import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Language {
    _id: string;
    name: string;
    code: string;
    symbol: string;
    isDefault: boolean;
    sortOrder: number;
}

interface UserPreferencesState {
    selectedLanguage: string | null;
    selectedLanguageInfo: Language | null;
    availableLanguages: Language[];
    selectedPlan: string | null;
    onboardingCompleted: boolean;
    searchHistory: string[];
}

const initialState: UserPreferencesState = {
    selectedLanguage: 'en', // Default to English
    selectedLanguageInfo: null,
    availableLanguages: [],
    selectedPlan: null,
    onboardingCompleted: false,
    searchHistory: [],
};

export const userPreferencesSlice = createSlice({
    name: 'userPreferences',
    initialState,
    reducers: {
        setSelectedLanguage: (state, action: PayloadAction<string>) => {
            state.selectedLanguage = action.payload;
            // Find and set the complete language info
            const languageInfo = state.availableLanguages.find(lang => lang.code === action.payload);
            if (languageInfo) {
                state.selectedLanguageInfo = languageInfo;
            }
        },
        setSelectedLanguageInfo: (state, action: PayloadAction<Language>) => {
            state.selectedLanguageInfo = action.payload;
            state.selectedLanguage = action.payload.code;
        },
        setAvailableLanguages: (state, action: PayloadAction<Language[]>) => {
            state.availableLanguages = action.payload;
            // If no language is selected, set English as default
            if (!state.selectedLanguage && action.payload.length > 0) {
                // First try to find a language marked as default
                const defaultLanguage = action.payload.find(lang => lang.isDefault);
                if (defaultLanguage) {
                    state.selectedLanguage = defaultLanguage.code;
                    state.selectedLanguageInfo = defaultLanguage;
                } else {
                    // Fallback to English if available
                    const englishLanguage = action.payload.find(lang => lang.code === 'en');
                    if (englishLanguage) {
                        state.selectedLanguage = 'en';
                        state.selectedLanguageInfo = englishLanguage;
                    } else {
                        // Final fallback to first available language
                        const firstLanguage = action.payload[0];
                        if (firstLanguage) {
                            state.selectedLanguage = firstLanguage.code;
                            state.selectedLanguageInfo = firstLanguage;
                        }
                    }
                }
            }
        },
        setSelectedPlan: (state, action: PayloadAction<string>) => {
            state.selectedPlan = action.payload;
        },
        setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
            state.onboardingCompleted = action.payload;
        },
        addToSearchHistory: (state, action: PayloadAction<string>) => {
            const searchTerm = action.payload?.trim() || '';
            if (searchTerm) {
                // Check for duplicates (case-insensitive)
                const isDuplicate = state.searchHistory.some(item =>
                    item.toLowerCase() === searchTerm.toLowerCase()
                );

                if (!isDuplicate) {
                    // Remove any existing similar terms (case-insensitive)
                    state.searchHistory = state.searchHistory.filter(item =>
                        item.toLowerCase() !== searchTerm.toLowerCase()
                    );

                    // Add to beginning of array
                    state.searchHistory.unshift(searchTerm);

                    // Keep only the last 5 items
                    if (state.searchHistory.length > 5) {
                        state.searchHistory = state.searchHistory.slice(0, 5);
                    }
                } else {
                    // If it's a duplicate, move it to the front
                    const existingIndex = state.searchHistory.findIndex(item =>
                        item.toLowerCase() === searchTerm.toLowerCase()
                    );
                    if (existingIndex > 0) {
                        const existingItem = state.searchHistory[existingIndex];
                        if (existingItem) {
                            state.searchHistory.splice(existingIndex, 1);
                            state.searchHistory.unshift(existingItem);
                        }
                    }
                }
            }
        },
        removeFromSearchHistory: (state, action: PayloadAction<string>) => {
            state.searchHistory = state.searchHistory.filter(item => item !== action.payload);
        },
        clearSearchHistory: (state) => {
            state.searchHistory = [];
        },
        clearUserPreferences: (state) => {
            state.selectedLanguage = 'en'; // Reset to English default
            state.selectedLanguageInfo = null;
            state.availableLanguages = [];
            state.selectedPlan = null;
            state.onboardingCompleted = false;
            state.searchHistory = [];
        },
    },
});

export const {
    setSelectedLanguage,
    setSelectedLanguageInfo,
    setAvailableLanguages,
    setSelectedPlan,
    setOnboardingCompleted,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    clearUserPreferences,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer;

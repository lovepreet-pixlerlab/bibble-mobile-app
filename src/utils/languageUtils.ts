/**
 * Dynamic Language Management Utilities
 * Handles flexible language fallback system for future language additions/removals
 */

interface Language {
    code: string;
    name: string;
    isDefault?: boolean;
    sortOrder?: number;
}

/**
 * Dynamic language text extraction with flexible fallback system
 * @param textObject - The multilingual text object
 * @param preferredLanguage - User's preferred language code
 * @param availableLanguages - Array of available languages from Redux persist
 * @param fallback - Fallback text if no language is found
 * @returns The best available text in the preferred language
 */
export const getBestAvailableText = (
    textObject: any,
    preferredLanguage: string,
    availableLanguages: Language[],
    fallback: string = ''
): string => {
    if (!textObject || typeof textObject !== 'object') {
        console.warn('⚠️ Invalid text object provided');
        return fallback;
    }

    // 1. Try the user's preferred language first
    if (textObject[preferredLanguage]) {
        console.log(`🎯 Found text in preferred language: ${preferredLanguage}`);
        return textObject[preferredLanguage];
    }

    // 2. Try available languages from Redux persist (in order of preference)
    if (availableLanguages && availableLanguages.length > 0) {
        // Sort languages by sortOrder if available, otherwise use array order
        const sortedLanguages = [...availableLanguages].sort((a, b) => {
            if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                return a.sortOrder - b.sortOrder;
            }
            return 0;
        });

        for (const lang of sortedLanguages) {
            if (textObject[lang.code]) {
                console.log(`🌍 Found text in available language: ${lang.code} (${lang.name})`);
                return textObject[lang.code];
            }
        }
    }

    // 3. Try any available language in the text object (dynamic discovery)
    const availableTextLanguages = Object.keys(textObject).filter(key =>
        typeof textObject[key] === 'string' && textObject[key].trim() !== ''
    );

    if (availableTextLanguages.length > 0) {
        const firstAvailableLanguage = availableTextLanguages[0];
        console.log(`📝 Found text in available language: ${firstAvailableLanguage}`);
        return textObject[firstAvailableLanguage];
    }

    // 4. Final fallback
    console.warn('⚠️ No suitable language found, using fallback');
    return fallback;
};

/**
 * Get all available language codes from a text object
 * @param textObject - The multilingual text object
 * @returns Array of available language codes
 */
export const getAvailableLanguageCodes = (textObject: any): string[] => {
    if (!textObject || typeof textObject !== 'object') {
        return [];
    }

    return Object.keys(textObject).filter(key =>
        typeof textObject[key] === 'string' && textObject[key].trim() !== ''
    );
};

/**
 * Check if a specific language is available in the text object
 * @param textObject - The multilingual text object
 * @param languageCode - The language code to check
 * @returns Boolean indicating if the language is available
 */
export const isLanguageAvailable = (textObject: any, languageCode: string): boolean => {
    if (!textObject || typeof textObject !== 'object') {
        return false;
    }

    return textObject[languageCode] &&
        typeof textObject[languageCode] === 'string' &&
        textObject[languageCode].trim() !== '';
};

/**
 * Get the best available language for a text object
 * @param textObject - The multilingual text object
 * @param preferredLanguage - User's preferred language code
 * @param availableLanguages - Array of available languages from Redux persist
 * @returns The best available language code
 */
export const getBestAvailableLanguage = (
    textObject: any,
    preferredLanguage: string,
    availableLanguages: Language[]
): string => {
    // 1. Check if preferred language is available
    if (isLanguageAvailable(textObject, preferredLanguage)) {
        return preferredLanguage;
    }

    // 2. Check available languages from Redux persist
    if (availableLanguages && availableLanguages.length > 0) {
        const sortedLanguages = [...availableLanguages].sort((a, b) => {
            if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                return a.sortOrder - b.sortOrder;
            }
            return 0;
        });

        for (const lang of sortedLanguages) {
            if (isLanguageAvailable(textObject, lang.code)) {
                return lang.code;
            }
        }
    }

    // 3. Return first available language
    const availableCodes = getAvailableLanguageCodes(textObject);
    return availableCodes.length > 0 ? availableCodes[0] : preferredLanguage;
};

/**
 * Debug function to log language availability
 * @param textObject - The multilingual text object
 * @param preferredLanguage - User's preferred language code
 * @param availableLanguages - Array of available languages from Redux persist
 */
export const debugLanguageAvailability = (
    textObject: any,
    preferredLanguage: string,
    availableLanguages: Language[]
): void => {
    console.log('🔍 Language Debug Info:');
    console.log('  Preferred Language:', preferredLanguage);
    console.log('  Available Languages from Redux:', availableLanguages?.map(l => `${l.code} (${l.name})`).join(', ') || 'None');
    console.log('  Available Languages in Text:', getAvailableLanguageCodes(textObject));
    console.log('  Best Available Language:', getBestAvailableLanguage(textObject, preferredLanguage, availableLanguages));
};

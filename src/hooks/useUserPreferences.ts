import { useSelector } from 'react-redux';

export const useUserPreferences = () => {
    const userPreferences = useSelector((state: any) => state.userPreferences);

    return {
        selectedLanguage: userPreferences.selectedLanguage,
        selectedLanguageInfo: userPreferences.selectedLanguageInfo,
        availableLanguages: userPreferences.availableLanguages,
        selectedPlan: userPreferences.selectedPlan,
        onboardingCompleted: userPreferences.onboardingCompleted,
    };
};

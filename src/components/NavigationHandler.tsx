import { getSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const NavigationHandler = () => {
    const { user, isAuthenticated } = useSelector((state: any) => state.user);
    const { selectedLanguage } = useSelector((state: any) => state.userPreferences);

    useEffect(() => {
        const checkAuthAndNavigate = async () => {
            try {
                const token = await getSession(STORAGE_KEYS.TOKEN);


                if (!token) {
                    console.log('🔍 No token, navigating to login');
                    router.push('/(auth)/login');
                } else if (isAuthenticated && user && selectedLanguage) {
                    // User is logged in, has user data, and has selected a language
                    // Check if user is a paid reader
                    if (user.paidReader === true) {
                        console.log('🔍 User is paid reader with language selected, navigating to main app');
                        router.replace('/(tabs)');
                    } else {
                        console.log('🔍 User needs plan selection, navigating to plan screen');
                        router.replace('/(onBoardingStack)/plan');
                    }
                } else if (token && !isAuthenticated) {
                    // Token exists but user data is not loaded yet (app startup)
                    console.log('🔍 Token exists but user not authenticated yet, waiting...');
                    // Don't navigate yet, wait for user data to load
                }
            } catch (error) {
                console.error('🔍 Navigation error:', error);
                router.push('/(auth)/login');
            }
        };

        // Only run navigation check if we have user data or no token
        if (isAuthenticated || !user) {
            checkAuthAndNavigate();
        }
    }, [user, isAuthenticated, selectedLanguage]);

    return null; // This component doesn't render anything
};

export default NavigationHandler;

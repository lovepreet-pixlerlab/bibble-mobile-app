import { getSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import GlobalLoader from '@/src/components/Loader';
import { toastConfig } from '@/src/helper/toastConfig';
import { initStripePayment } from '@/src/utils/stripeInit';
import Toast from 'react-native-toast-message';
import { persistor, store } from '../src/redux/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Initialize Stripe when app starts
  useEffect(() => {
    initStripePayment();
    console.log('🔍 RootLayout mounted');
  }, []);

  // Simple app startup navigation check
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const token = await getSession(STORAGE_KEYS.TOKEN);
        console.log('🔍 App startup - Token:', token);

        if (!token) {
          console.log('🔍 No token, navigating to login');
          router.push('/(auth)/login');
        }
        // If token exists, let the login flow handle navigation
      } catch (error) {
        console.error('🔍 App startup navigation error:', error);
        router.push('/(auth)/login');
      }
    };

    checkInitialAuth();
  }, []);


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalLoader />
        <Stack>
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(onBoardingStack)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="hymns" options={{ headerShown: false }} />
          <Stack.Screen name="singleHymn" options={{ headerShown: false }} />
          <Stack.Screen name="fontSize" options={{ headerShown: false }} />
          <Stack.Screen name="changePassword" options={{ headerShown: false }} />
          <Stack.Screen name="inspired/index" options={{ headerShown: false }} />
          <Stack.Screen name="chapterScreen/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>
        <Toast config={toastConfig} />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}

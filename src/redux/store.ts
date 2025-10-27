import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import fontSizeSlice from './features/fontSize';
import globalSlice from './features/global';
import persistSlice from './features/persist';
import userPreferencesSlice from './features/userPreferences';
import { baseApi } from './services/api';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['persist'],
};

const persistedReducer = persistReducer(persistConfig, persistSlice);

// Create a separate persist config for userPreferences
const userPreferencesPersistConfig = {
  key: 'userPreferences',
  storage: AsyncStorage,
  whitelist: ['selectedLanguage', 'selectedLanguageInfo', 'availableLanguages', 'selectedPlan', 'onboardingCompleted'],
};

// Create a separate persist config for fontSize
const fontSizePersistConfig = {
  key: 'fontSize',
  storage: AsyncStorage,
  whitelist: ['verseFontSize'],
};

const persistedUserPreferencesReducer = persistReducer(userPreferencesPersistConfig, userPreferencesSlice);
const persistedFontSizeReducer = persistReducer(fontSizePersistConfig, fontSizeSlice);

export const store = configureStore({
  reducer: {
    global: globalSlice,
    userPreferences: persistedUserPreferencesReducer,
    fontSize: persistedFontSizeReducer,
    persist: persistedReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

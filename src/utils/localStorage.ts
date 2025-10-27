// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  OTP: 'otp',
  // Add more keys here if needed
};

// Save a value
export const setSession = async (key: string, value: any) => {
  try {
    if (key === null || key === undefined) {
      throw new Error('Storage key cannot be null or undefined');
    }

    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error setting AsyncStorage key "${key}":`, error);
    throw error; // Re-throw to allow calling code to handle
  }
};

// Get a value
export const getSession = async (key: string) => {
  try {
    if (key === null || key === undefined) {
      throw new Error('Storage key cannot be null or undefined');
    }

    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue === null) {
      return null;
    }

    try {
      return JSON.parse(jsonValue);
    } catch (parseError) {
      // If JSON parsing fails, return the raw string value
      return jsonValue;
    }
  } catch (error) {
    console.error(`Error getting AsyncStorage key "${key}":`, error);
    return null;
  }
};

// Remove a value
export const removeSession = async (key: string) => {
  try {
    if (key === null || key === undefined) {
      throw new Error('Storage key cannot be null or undefined');
    }

    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing AsyncStorage key "${key}":`, error);
    throw error; // Re-throw to allow calling code to handle
  }
};

// Clear all storage
export const clearSession = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    throw error; // Re-throw to allow calling code to handle
  }
};

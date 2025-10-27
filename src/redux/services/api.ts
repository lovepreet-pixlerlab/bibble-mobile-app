import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getSession, STORAGE_KEYS } from '../../utils/localStorage';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.10:4041';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/`,
    prepareHeaders: async headers => {
      try {
        const token = await getSession(STORAGE_KEYS.TOKEN);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.warn('Error getting token from storage:', error);
      }
      return headers;
    },
    // Log only Full URL
    fetchFn: async (input, init) => {
      // console.log('📍 Full URL:', input);
      return fetch(input, init);
    },
  }),
  endpoints: () => ({

  }),
});

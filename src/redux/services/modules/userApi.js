// import { METHODS } from '../../methods';
import { baseApi } from '../api';
import { apiEndPointes } from '../apiEndpoints';

export const userApi = baseApi.injectEndpoints({
    endpoints: build => ({
        // User Languages API
        getLanguages: build.query({
            query: () => ({
                url: apiEndPointes.userLanguages,
                method: 'GET',
            }),
        }),
        // User Hymns API
        getHymns: build.query({
            query: (params) => ({
                url: apiEndPointes.userHymns,
                method: 'GET',
                params: params,
            }),
        }),
        // User Single Hymn API - Dynamic endpoint with productId in path
        getSingleHymn: build.query({
            query: (productId) => ({
                url: `${apiEndPointes.userSingleHymn}/${productId}`,
                method: 'GET',
            }),
        }),
        // User Favorites API
        getFavorites: build.query({
            query: (params) => ({
                url: apiEndPointes.userFavorites,
                method: 'GET',
                params: params,
            }),
        }),
        addToFavorites: build.mutation({
            query: (data) => ({
                url: apiEndPointes.userFavorites,
                method: 'POST',
                body: data,
            }),
        }),
        // User Remove Favorite API - Dynamic endpoint with favoriteId in path
        removeFromFavorites: build.mutation({
            query: (favoriteId) => ({
                url: `${apiEndPointes.userRemoveFavorite}/${favoriteId}`,
                method: 'DELETE',
            }),
        }),
        // User Stories API
        getStories: build.query({
            query: (params) => ({
                url: apiEndPointes.userStories,
                method: 'GET',
                params: params,
            }),
        }),
        // User Chapters API - Dynamic endpoint with storyId in path
        getChapters: build.query({
            query: (storyId) => ({
                url: `${apiEndPointes.userChapters}/${storyId}`,
                method: 'GET',
            }),
        }),
        // User Verses API - Dynamic endpoint with chapterId in path
        getVerses: build.query({
            query: (chapterId) => ({
                url: `${apiEndPointes.userVerses}/${chapterId}`,
                method: 'GET',
            }),
        }),
        // User Search API
        searchContent: build.query({
            query: (params) => ({
                url: apiEndPointes.userSearch,
                method: 'GET',
                params: params,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useLazyGetLanguagesQuery,
    useLazyGetHymnsQuery,
    useLazyGetSingleHymnQuery,
    useLazyGetFavoritesQuery,
    useAddToFavoritesMutation,
    useRemoveFromFavoritesMutation,
    useLazyGetStoriesQuery,
    useLazyGetChaptersQuery,
    useLazyGetVersesQuery,
    useLazySearchContentQuery
} = userApi;

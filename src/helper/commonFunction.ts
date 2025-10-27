import { Dispatch } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import { setLoaderStatus } from '../redux/features/global';

let dispatch1: Dispatch | null = null;

export const setDispatch = (dispatch: Dispatch) => {
    dispatch1 = dispatch;
};

export const setGlobalLoader = (status: boolean) => {
    if (dispatch1) {
        dispatch1(setLoaderStatus(status));
    }
};

export const logout = async () => {
    router.replace('/(auth)/welcome');
};

export const getImageUrl = (url: string) => {
    return { uri: `${process.env.EXPO_PUBLIC_API_URL}/${url}` };
};

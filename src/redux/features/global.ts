import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GlobalState {
    isLoading: boolean;
}

const initialState: GlobalState = {
    isLoading: false,
};

export const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setLoaderStatus: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setLoaderStatus } = globalSlice.actions;
export default globalSlice.reducer;
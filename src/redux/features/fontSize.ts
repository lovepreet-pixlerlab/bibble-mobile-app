import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FontSizeState {
    verseFontSize: number;
}

const defaultFontSize = 16;

const initialState: FontSizeState = {
    verseFontSize: defaultFontSize,
};

export const fontSizeSlice = createSlice({
    name: 'fontSize',
    initialState,
    reducers: {
        setVerseFontSize: (state, action: PayloadAction<number>) => {
            state.verseFontSize = action.payload;
        },
        resetFontSize: (state) => {
            state.verseFontSize = defaultFontSize;
        },
    },
});

export const { setVerseFontSize, resetFontSize } = fontSizeSlice.actions;
export default fontSizeSlice.reducer;

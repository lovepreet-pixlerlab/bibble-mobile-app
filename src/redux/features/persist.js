import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: '',
};

export const persistSlice = createSlice({
  name: 'persist',
  initialState,
  reducers: {
    settoken: (state, action) => {
      return { ...state, token: action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const { settoken } = persistSlice.actions;

export default persistSlice.reducer;

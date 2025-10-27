import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    _id: string;
    id: string;
    email: string;
    name: string;
    isEmailVarify: boolean;
    paidReader: boolean;
    role: string;
    status: string;
    city?: string | null;
    country?: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setPaidReader: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.paidReader = action.payload;
            }
        },
    },
});

export const { setUser, updateUser, clearUser, setPaidReader } = userSlice.actions;
export default userSlice.reducer;

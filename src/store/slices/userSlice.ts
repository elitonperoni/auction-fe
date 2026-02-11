import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  isAuthenticated: false,
  expiresAt: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string; expiresAt: number, isAuthenticated: boolean}>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.expiresAt = action.payload.expiresAt;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    updateExpiration: (state, action: PayloadAction<number>) => {
      state.expiresAt = action.payload;
    },
    logout: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateName, logout, updateExpiration } = userSlice.actions;
export default userSlice.reducer;
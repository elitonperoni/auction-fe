import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dictionary } from '@/lib/get-dictionary'; 

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  dict: Dictionary | null; // <--- Novo campo
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  isAuthenticated: false,
  expiresAt: null,
  dict: null 
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string; expiresAt: number }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.expiresAt = action.payload.expiresAt;
      state.isAuthenticated = true;
    },
    setDictionary: (state, action: PayloadAction<Dictionary>) => {
      state.dict = action.payload;
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

export const { setUser, updateName, logout, updateExpiration, setDictionary } = userSlice.actions;
export default userSlice.reducer;
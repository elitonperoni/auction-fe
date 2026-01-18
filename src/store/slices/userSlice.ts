import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string; }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.isAuthenticated = true;
    },
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    logout: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateName, logout } = userSlice.actions;
export default userSlice.reducer;
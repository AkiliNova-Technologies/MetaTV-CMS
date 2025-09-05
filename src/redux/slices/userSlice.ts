import StorageParams from "@/constants/StorageParams";
import type { User } from "@/types/user";
import api from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import localStorage from "redux-persist/es/storage";

interface UserState {
    users: User[];
    loading: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    users: [],
    loading: false,
    status: 'idle',
    error: null,
};

export const loadUsers = createAsyncThunk(
  'user/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await localStorage.getItem(StorageParams.CACHED_USERS);
      const cachedParsed: User[] = cached ? JSON.parse(cached) : [];

      const response = await api.get("/users");
      console.log("API response:", response.data);  // <--- log here
      const latest: User[] = Array.isArray(response.data) ? response.data : [];

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await localStorage.setItem(StorageParams.CACHED_USERS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch {
      return rejectWithValue("Failed to load users");
    }
  }
);


const userSlice = createSlice({
    name:'user',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loadUsers.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(loadUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(loadUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.users = [];
                state.error = action.payload as string;
            });
    },
})

export default userSlice.reducer;
import StorageParams from "@/constants/StorageParams";
import type { Music } from "@/types/music";
import api from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import localStorage from "redux-persist/es/storage";

interface MusicState {
    music: Music[];
    loading: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: MusicState = {
    music: [],
    loading: false,
    status: 'idle',
    error: null,
};

export const loadMusic = createAsyncThunk(
    'music/loadMusic',
    async (_,{rejectWithValue}) => {
        try {
            const cached = await localStorage.getItem(StorageParams.CACHED_MUSIC);
            const cachedParsed: Music[] = cached ? JSON.parse(cached) : [];

            const response = await api.get("/music");
            const latest: Music[] = response.data;

            if(JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
                await localStorage.setItem(StorageParams.CACHED_MUSIC, JSON.stringify(latest));
                return latest;
            }
            return cachedParsed;
        } catch {
            return rejectWithValue("Failed to load music");
        }
    
    }
)

const musicSlice = createSlice({
    name:'music',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loadMusic.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(loadMusic.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.music = action.payload;
            })
            .addCase(loadMusic.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.music = [];
                state.error = action.payload as string;
            });
    },
})

export default musicSlice.reducer;
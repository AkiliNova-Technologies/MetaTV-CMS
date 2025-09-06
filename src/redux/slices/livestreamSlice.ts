import StorageParams from "@/constants/StorageParams";
import type { Livestream} from "@/types/livestream";
import api from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import localStorage from "redux-persist/es/storage";

interface VideoState {
    livestreams: Livestream[];
    loading: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: VideoState = {
    livestreams: [],
    loading: false,
    status: 'idle',
    error: null,
};

export const loadLiveStreams = createAsyncThunk(
    'livestream/loadLiveStreams',
    async (_,{rejectWithValue}) => {
        try {
            const cached = await localStorage.getItem(StorageParams.CACHED_LIVESTREAMS);
            const cachedParsed: Livestream[] = cached ? JSON.parse(cached) : [];

            const response = await api.get("/livestreams");
            const latest: Livestream[] = response.data;

            if(JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
                await localStorage.setItem(StorageParams.CACHED_LIVESTREAMS, JSON.stringify(latest));
                return latest;
            }
            return cachedParsed;
        } catch {
            return rejectWithValue("Failed to load livestreams");
        }
    
    }
)

const livestreamSlice = createSlice({
    name:'livestream',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loadLiveStreams.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(loadLiveStreams.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.livestreams = action.payload;
            })
            .addCase(loadLiveStreams.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.livestreams = [];
                state.error = action.payload as string;
            });
    },
})

export default livestreamSlice.reducer;
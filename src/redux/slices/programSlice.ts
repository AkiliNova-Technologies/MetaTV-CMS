import StorageParams from "@/constants/StorageParams";
import type { Program } from "@/types/program";
import api from "@/utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import localStorage from "redux-persist/es/storage";

interface ProgramState {
    programs: Program[];
    loading: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ProgramState = {
    programs: [],
    loading: false,
    status: 'idle',
    error: null,
};

export const loadPrograms = createAsyncThunk(
    'program/loadPrograms',
    async (_,{rejectWithValue}) => {
        try {
            const cached = await localStorage.getItem(StorageParams.CACHED_PROGRAMS);
            const cachedParsed: Program[] = cached ? JSON.parse(cached) : [];

            const response = await api.get("/programs");
            const latest: Program[] = response.data;

            if(JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
                await localStorage.setItem(StorageParams.CACHED_PROGRAMS, JSON.stringify(latest));
                return latest;
            }
            return cachedParsed;
        } catch {
            return rejectWithValue("Failed to load programs");
        }
    
    }
)

const programSlice = createSlice({
    name:'program',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loadPrograms.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(loadPrograms.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.programs = action.payload;
            })
            .addCase(loadPrograms.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.programs = [];
                state.error = action.payload as string;
            });
    },
})

export default programSlice.reducer;
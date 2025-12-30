import StorageParams from "@/constants/StorageParams";
import type { Program } from "@/types/program";
import api from "@/utils/api";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

interface ProgramState {
  programs: Program[];
  userSubscriptions: number[]; 
  loading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  subscriptionLoading: { [programId: number]: boolean }; 
}

const initialState: ProgramState = {
  programs: [],
  userSubscriptions: [],
  loading: false,
  status: 'idle',
  error: null,
  subscriptionLoading: {},
};

/**
 * Load all programs
 */
export const loadPrograms = createAsyncThunk(
  'program/loadPrograms',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await storage.getItem(StorageParams.CACHED_PROGRAMS);
      const cachedParsed: Program[] = cached ? JSON.parse(cached) : [];
      const response = await api.get("/programs");
      const latest: Program[] = response.data;
      
      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await storage.setItem(StorageParams.CACHED_PROGRAMS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch (error) {
      return rejectWithValue("Failed to load programs");
    }
  }
);

/**
 * Load user's subscribed programs
 */
export const loadUserSubscriptions = createAsyncThunk(
  'program/loadUserSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/programs/user/subscriptions");
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load user subscriptions");
    }
  }
);

/**
 * Toggle subscription to a program
 */
export const toggleSubscription = createAsyncThunk(
  'program/toggleSubscription',
  async (programId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/programs/${programId}/subscribe`);
      return {
        programId,
        isSubscribed: response.data.isSubscribed,
        subscribers: response.data.subscribers,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle subscription");
    }
  }
);

/**
 * Get subscription status for a program
 */
export const getSubscriptionStatus = createAsyncThunk(
  'program/getSubscriptionStatus',
  async (programId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/programs/${programId}/subscribe`);
      return {
        programId,
        isSubscribed: response.data.isSubscribed,
        subscribers: response.data.subscribers,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to get subscription status");
    }
  }
);

const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    /**
     * Update a specific program in the state
     */
    updateProgram: (state, action: PayloadAction<{ programId: number; updates: Partial<Program> }>) => {
      const { programId, updates } = action.payload;
      const programIndex = state.programs.findIndex(p => p.id === programId);
      if (programIndex !== -1) {
        state.programs[programIndex] = {
          ...state.programs[programIndex],
          ...updates,
        };
      }
    },

    /**
     * Clear all programs (useful for logout)
     */
    clearPrograms: (state) => {
      state.programs = [];
      state.userSubscriptions = [];
      state.status = 'idle';
    },

    /**
     * Set subscription loading state
     */
    setSubscriptionLoading: (state, action: PayloadAction<{ programId: number; loading: boolean }>) => {
      state.subscriptionLoading[action.payload.programId] = action.payload.loading;
    },
  },
  extraReducers(builder) {
    builder
      // Load programs cases
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
      })

      // Load user subscriptions cases
      .addCase(loadUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        // Extract program IDs from subscribed programs
        state.userSubscriptions = action.payload.map((program: Program) => program.id);
      })
      .addCase(loadUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle subscription cases
      .addCase(toggleSubscription.pending, (state, action) => {
        state.subscriptionLoading[action.meta.arg] = true;
      })
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        const { programId, isSubscribed, subscribers } = action.payload;
        state.subscriptionLoading[programId] = false;

        // Update user subscriptions list
        if (isSubscribed) {
          if (!state.userSubscriptions.includes(programId)) {
            state.userSubscriptions.push(programId);
          }
        } else {
          state.userSubscriptions = state.userSubscriptions.filter(id => id !== programId);
        }

        // Update program's subscriber count in the programs list
        const programIndex = state.programs.findIndex(p => p.id === programId);
        if (programIndex !== -1) {
          const currentProgram = state.programs[programIndex];
          state.programs[programIndex] = {
            ...currentProgram,
            _count: {
              videos: currentProgram._count?.videos || 0,
              subscribers: subscribers,
            },
          };
        }
      })
      .addCase(toggleSubscription.rejected, (state, action) => {
        state.subscriptionLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      })

      // Get subscription status cases
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        const { programId, isSubscribed, subscribers } = action.payload;

        // Update user subscriptions list
        if (isSubscribed && !state.userSubscriptions.includes(programId)) {
          state.userSubscriptions.push(programId);
        } else if (!isSubscribed) {
          state.userSubscriptions = state.userSubscriptions.filter(id => id !== programId);
        }

        // Update program's subscriber count
        const programIndex = state.programs.findIndex(p => p.id === programId);
        if (programIndex !== -1) {
          const currentProgram = state.programs[programIndex];
          state.programs[programIndex] = {
            ...currentProgram,
            _count: {
              videos: currentProgram._count?.videos || 0,
              subscribers: subscribers,
            },
          };
        }
      });
  },
});

export const { updateProgram, clearPrograms, setSubscriptionLoading } = programSlice.actions;
export default programSlice.reducer;
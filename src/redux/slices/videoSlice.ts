import StorageParams from "@/constants/StorageParams";
import type { Video } from "@/types/video";
import api from "@/utils/api";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  relatedVideos: Video[];
  likedVideos: number[];
  dislikedVideos: number[];
  savedVideos: number[];
  loading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  likeLoading: { [videoId: number]: boolean };
  commentLoading: { [videoId: number]: boolean };
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  relatedVideos: [],
  likedVideos: [],
  dislikedVideos: [],
  savedVideos: [],
  loading: false,
  status: 'idle',
  error: null,
  likeLoading: {},
  commentLoading: {},
};

export const loadVideos = createAsyncThunk(
  'video/loadVideos',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await storage.getItem(StorageParams.CACHED_VIDEOS);
      const cachedParsed: Video[] = cached ? JSON.parse(cached) : [];
      const response = await api.get("/videos");
      const latest: Video[] = response.data;
      
      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await storage.setItem(StorageParams.CACHED_VIDEOS, JSON.stringify(latest));
        return latest;
      }
      return cachedParsed;
    } catch (error) {
      return rejectWithValue("Failed to load videos");
    }
  }
);

export const loadVideoById = createAsyncThunk(
  'video/loadVideoById',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load video");
    }
  }
);

export const loadRelatedVideos = createAsyncThunk(
  'video/loadRelatedVideos',
  async ({ videoId, category }: { videoId: number; category?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('videoId', videoId.toString());
      if (category) params.append('category', category);
      
      const response = await api.get(`/videos/related?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load related videos");
    }
  }
);

export const toggleLike = createAsyncThunk(
  'video/toggleLike',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      return {
        videoId,
        isLiked: response.data.isLiked,
        isDisliked: response.data.isDisliked,
        likes: response.data.likes,
        dislikes: response.data.dislikes,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle like");
    }
  }
);

export const toggleDislike = createAsyncThunk(
  'video/toggleDislike',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/dislike`);
      return {
        videoId,
        isLiked: response.data.isLiked,
        isDisliked: response.data.isDisliked,
        likes: response.data.likes,
        dislikes: response.data.dislikes,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle dislike");
    }
  }
);

export const getLikeStatus = createAsyncThunk(
  'video/getLikeStatus',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${videoId}/like`);
      return {
        videoId,
        isLiked: response.data.isLiked,
        isDisliked: response.data.isDisliked,
        likes: response.data.likes,
        dislikes: response.data.dislikes,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to get like status");
    }
  }
);

export const addComment = createAsyncThunk(
  'video/addComment',
  async (
    { videoId, text, parentCommentId }: { videoId: number; text: string; parentCommentId?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/videos/${videoId}/comments`, {
        text,
        parentCommentId,
      });
      return {
        videoId,
        comment: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add comment");
    }
  }
);

export const incrementViews = createAsyncThunk(
  'video/incrementViews',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/view`);
      return {
        videoId,
        views: response.data.views,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to increment views");
    }
  }
);

export const searchVideos = createAsyncThunk(
  'video/searchVideos',
  async (searchParams: any, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      const response = await api.get(`/videos/search/advanced?${params.toString()}`);
      return response.data.videos;
    } catch (error) {
      return rejectWithValue("Failed to search videos");
    }
  }
);

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    updateVideo: (state, action: PayloadAction<{ videoId: number; updates: Partial<Video> }>) => {
      const { videoId, updates } = action.payload;
      const videoIndex = state.videos.findIndex(v => v.id === videoId);
      if (videoIndex !== -1) {
        state.videos[videoIndex] = {
          ...state.videos[videoIndex],
          ...updates,
        };
      }
      
      if (state.currentVideo?.id === videoId) {
        state.currentVideo = {
          ...state.currentVideo,
          ...updates,
        };
      }
    },

    clearCurrentVideo: (state) => {
      state.currentVideo = null;
      state.relatedVideos = [];
    },

    clearVideos: (state) => {
      state.videos = [];
      state.currentVideo = null;
      state.relatedVideos = [];
      state.likedVideos = [];
      state.dislikedVideos = [];
      state.savedVideos = [];
      state.status = 'idle';
    },

    setLikeLoading: (state, action: PayloadAction<{ videoId: number; loading: boolean }>) => {
      state.likeLoading[action.payload.videoId] = action.payload.loading;
    },

    setCommentLoading: (state, action: PayloadAction<{ videoId: number; loading: boolean }>) => {
      state.commentLoading[action.payload.videoId] = action.payload.loading;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadVideos.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(loadVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.videos = [];
        state.error = action.payload as string;
      })

      .addCase(loadVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(loadVideoById.rejected, (state, action) => {
        state.loading = false;
        state.currentVideo = null;
        state.error = action.payload as string;
      })

      .addCase(loadRelatedVideos.fulfilled, (state, action) => {
        state.relatedVideos = action.payload;
      })

      .addCase(toggleLike.pending, (state, action) => {
        state.likeLoading[action.meta.arg] = true;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { videoId, isLiked, likes, dislikes } = action.payload;
        state.likeLoading[videoId] = false;

        if (isLiked) {
          if (!state.likedVideos.includes(videoId)) {
            state.likedVideos.push(videoId);
          }
          state.dislikedVideos = state.dislikedVideos.filter(id => id !== videoId);
        } else {
          state.likedVideos = state.likedVideos.filter(id => id !== videoId);
        }

        // Update video with _count structure
        const videoIndex = state.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
          const currentVideo = state.videos[videoIndex];
          state.videos[videoIndex] = {
            ...currentVideo,
            _count: {
              likes: likes,
              dislikes: dislikes,
              comments: currentVideo._count?.comments || 0,
            },
          };
        }

        if (state.currentVideo?.id === videoId) {
          state.currentVideo = {
            ...state.currentVideo,
            _count: {
              likes: likes,
              dislikes: dislikes,
              comments: state.currentVideo._count?.comments || 0,
            },
          };
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.likeLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      })

      .addCase(toggleDislike.pending, (state, action) => {
        state.likeLoading[action.meta.arg] = true;
      })
      .addCase(toggleDislike.fulfilled, (state, action) => {
        const { videoId, isDisliked, likes, dislikes } = action.payload;
        state.likeLoading[videoId] = false;

        if (isDisliked) {
          if (!state.dislikedVideos.includes(videoId)) {
            state.dislikedVideos.push(videoId);
          }
          state.likedVideos = state.likedVideos.filter(id => id !== videoId);
        } else {
          state.dislikedVideos = state.dislikedVideos.filter(id => id !== videoId);
        }

        // Update video with _count structure
        const videoIndex = state.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
          const currentVideo = state.videos[videoIndex];
          state.videos[videoIndex] = {
            ...currentVideo,
            _count: {
              likes: likes,
              dislikes: dislikes,
              comments: currentVideo._count?.comments || 0,
            },
          };
        }

        if (state.currentVideo?.id === videoId) {
          state.currentVideo = {
            ...state.currentVideo,
            _count: {
              likes: likes,
              dislikes: dislikes,
              comments: state.currentVideo._count?.comments || 0,
            },
          };
        }
      })
      .addCase(toggleDislike.rejected, (state, action) => {
        state.likeLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      })

      .addCase(getLikeStatus.fulfilled, (state, action) => {
        const { videoId, isLiked, isDisliked } = action.payload;

        if (isLiked && !state.likedVideos.includes(videoId)) {
          state.likedVideos.push(videoId);
        } else if (!isLiked) {
          state.likedVideos = state.likedVideos.filter(id => id !== videoId);
        }

        if (isDisliked && !state.dislikedVideos.includes(videoId)) {
          state.dislikedVideos.push(videoId);
        } else if (!isDisliked) {
          state.dislikedVideos = state.dislikedVideos.filter(id => id !== videoId);
        }
      })

      .addCase(addComment.pending, (state, action) => {
        state.commentLoading[action.meta.arg.videoId] = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.commentLoading[action.payload.videoId] = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        if (action.meta.arg) {
          state.commentLoading[action.meta.arg.videoId] = false;
        }
        state.error = action.payload as string;
      })

      .addCase(incrementViews.fulfilled, (state, action) => {
        const { videoId, views } = action.payload;

        const videoIndex = state.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
          state.videos[videoIndex] = {
            ...state.videos[videoIndex],
            views,
          };
        }

        if (state.currentVideo?.id === videoId) {
          state.currentVideo = {
            ...state.currentVideo,
            views,
          };
        }
      })

      .addCase(searchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateVideo,
  clearCurrentVideo,
  clearVideos,
  setLikeLoading,
  setCommentLoading,
} = videoSlice.actions;

export default videoSlice.reducer;
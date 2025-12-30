import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  loadVideos,
  loadVideoById,
  loadRelatedVideos,
  toggleLike,
  toggleDislike,
  getLikeStatus,
  addComment,
  incrementViews,
  searchVideos,
  updateVideo,
  clearCurrentVideo,
  clearVideos,
} from "@/redux/slices/videoSlice";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useReduxVideos() {
  const dispatch = useAppDispatch();
  const {
    videos,
    currentVideo,
    relatedVideos,
    likedVideos,
    dislikedVideos,
    loading,
    error,
    status,
    likeLoading,
    commentLoading,
  } = useAppSelector((state) => state.video);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Reload all videos
   */
  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadVideos());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Load a single video by ID
   */
  const loadVideo = useCallback(
    async (videoId: number) => {
      try {
        const result = await dispatch(loadVideoById(videoId));
        if (loadVideoById.fulfilled.match(result)) {
          return result.payload;
        }
        return null;
      } catch (error) {
        console.error("Failed to load video:", error);
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Load related videos for a video
   */
  const loadRelated = useCallback(
    async (videoId: number, category?: string) => {
      try {
        await dispatch(loadRelatedVideos({ videoId, category }));
      } catch (error) {
        console.error("Failed to load related videos:", error);
      }
    },
    [dispatch]
  );

  /**
   * Like a video
   */
  const likeVideo = useCallback(
    async (videoId: number) => {
      try {
        const result = await dispatch(toggleLike(videoId));

        if (toggleLike.fulfilled.match(result)) {
          const { isLiked } = result.payload;
          toast.success(isLiked ? "Liked!" : "Like removed");
          return result.payload;
        } else {
          toast.error("Failed to like video");
          return null;
        }
      } catch (error) {
        console.error("Failed to like video:", error);
        toast.error("Failed to like video");
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Dislike a video
   */
  const dislikeVideo = useCallback(
    async (videoId: number) => {
      try {
        const result = await dispatch(toggleDislike(videoId));

        if (toggleDislike.fulfilled.match(result)) {
          const { isDisliked } = result.payload;
          toast.success(isDisliked ? "Disliked!" : "Dislike removed");
          return result.payload;
        } else {
          toast.error("Failed to dislike video");
          return null;
        }
      } catch (error) {
        console.error("Failed to dislike video:", error);
        toast.error("Failed to dislike video");
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Check if user has liked a video
   */
  const isLiked = useCallback(
    (videoId: number): boolean => {
      return likedVideos.includes(videoId);
    },
    [likedVideos]
  );

  /**
   * Check if user has disliked a video
   */
  const isDisliked = useCallback(
    (videoId: number): boolean => {
      return dislikedVideos.includes(videoId);
    },
    [dislikedVideos]
  );

  /**
   * Get like status for a video (fetches from server)
   */
  const checkLikeStatus = useCallback(
    async (videoId: number) => {
      try {
        const result = await dispatch(getLikeStatus(videoId));

        if (getLikeStatus.fulfilled.match(result)) {
          return result.payload;
        }
        return null;
      } catch (error) {
        console.error("Failed to check like status:", error);
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Add a comment to a video
   */
  const commentOnVideo = useCallback(
    async (videoId: number, text: string, parentCommentId?: number) => {
      try {
        const result = await dispatch(addComment({ videoId, text, parentCommentId }));

        if (addComment.fulfilled.match(result)) {
          toast.success("Comment added!");
          return result.payload.comment;
        } else {
          toast.error("Failed to add comment");
          return null;
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
        toast.error("Failed to add comment");
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Increment video views
   */
  const recordView = useCallback(
    async (videoId: number) => {
      try {
        await dispatch(incrementViews(videoId));
      } catch (error) {
        // Silent fail for view tracking
        console.error("Failed to increment views:", error);
      }
    },
    [dispatch]
  );

  /**
   * Search videos
   */
  const search = useCallback(
    async (searchParams: any) => {
      try {
        const result = await dispatch(searchVideos(searchParams));

        if (searchVideos.fulfilled.match(result)) {
          return result.payload;
        }
        return [];
      } catch (error) {
        console.error("Failed to search videos:", error);
        toast.error("Failed to search videos");
        return [];
      }
    },
    [dispatch]
  );

  /**
   * Get a specific video by ID
   */
  const getVideoById = useCallback(
    (videoId: number) => {
      return videos.find((v) => v.id === videoId);
    },
    [videos]
  );

  /**
   * Get all liked videos
   */
  const getLikedVideos = useCallback(() => {
    return videos.filter((v) => likedVideos.includes(v.id));
  }, [videos, likedVideos]);

  /**
   * Update a video in the state
   */
  const updateVideoData = useCallback(
    (videoId: number, updates: any) => {
      dispatch(updateVideo({ videoId, updates }));
    },
    [dispatch]
  );

  /**
   * Clear current video
   */
  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentVideo());
  }, [dispatch]);

  /**
   * Clear all videos (useful for logout)
   */
  const clear = useCallback(() => {
    dispatch(clearVideos());
  }, [dispatch]);

  /**
   * Check if a specific video like is loading
   */
  const isLikeLoading = useCallback(
    (videoId: number): boolean => {
      return likeLoading[videoId] || false;
    },
    [likeLoading]
  );

  /**
   * Check if a specific video comment is loading
   */
  const isCommentLoading = useCallback(
    (videoId: number): boolean => {
      return commentLoading[videoId] || false;
    },
    [commentLoading]
  );

  /**
   * Auto-load videos on mount if empty
   */
  useEffect(() => {
    if (!loading && videos.length === 0 && status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 1000); // Reduced from 15000 to 1000 for faster initial load
      return () => clearTimeout(timeout);
    }
  }, [loading, videos, reload, status]);

  return {
    // Data
    videos,
    currentVideo,
    relatedVideos,
    likedVideos: getLikedVideos(),

    // State
    loading: loading || refreshing,
    error,
    status,
    likeLoading,
    commentLoading,

    // Actions
    reload,
    loadVideo,
    loadRelated,
    likeVideo,
    dislikeVideo,
    isLiked,
    isDisliked,
    checkLikeStatus,
    commentOnVideo,
    recordView,
    search,
    getVideoById,
    getLikedVideos,
    updateVideoData,
    clearCurrent,
    clear,
    isLikeLoading,
    isCommentLoading,
  };
}
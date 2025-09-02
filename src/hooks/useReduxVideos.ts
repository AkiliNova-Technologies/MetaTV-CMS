import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadVideos } from "@/redux/slices/videoSlice";
import { useCallback, useEffect, useState } from "react";

export function useReduxVideos() {
  const dispatch = useAppDispatch();
  const { videos, loading, error, status } = useAppSelector((state) => state.video);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadVideos());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, setRefreshing]);

  useEffect(() => {
    if (!loading && videos.length === 0 && status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [loading, videos, reload, status]);

  return { videos, loading: loading || refreshing, error, reload };
}

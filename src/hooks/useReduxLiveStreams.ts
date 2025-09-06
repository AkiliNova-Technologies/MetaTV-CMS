import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadLiveStreams } from "@/redux/slices/livestreamSlice";
import { useCallback, useEffect, useState } from "react";

export function useReduxLiveStreams() {
  const dispatch = useAppDispatch();
  const { livestreams, loading, error, status } = useAppSelector(
    (state) => state.livestream
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadLiveStreams());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, setRefreshing]);

  useEffect(() => {
    if (!loading && livestreams.length === 0 && status === "idle") {
      const timeout = setTimeout(() => {
        reload();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [loading, livestreams, reload, status]);

  return { livestreams, loading: loading || refreshing, error, reload };
}

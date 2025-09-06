// hooks/useReduxMusic.ts
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadMusic } from "@/redux/slices/musicSlice";
import type { Music } from "@/types/music";
import { useCallback, useEffect, useState } from "react";

interface MusicState {
  music: Music[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  status: string;
}

export function useReduxMusic() {
  const dispatch = useAppDispatch();
  const musicState = useAppSelector((state) => state.music) as MusicState;
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadMusic());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, setRefreshing]);

  useEffect(() => {
    if (!musicState.loading && musicState.music.length === 0 && musicState.status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [musicState.loading, musicState.music, reload, musicState.status]);

  return { 
    music: musicState.music, // Return just the music array
    loading: musicState.loading || refreshing, 
    error: musicState.error, 
    reload 
  };
}
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadPrograms } from "@/redux/slices/programSlice";
import { useCallback, useEffect, useState } from "react";

export function useReduxPrograms() {
  const dispatch = useAppDispatch();
  const { programs, loading, error, status } = useAppSelector((state) => state.program);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadPrograms());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, setRefreshing]);

  useEffect(() => {
    if (!loading && programs.length === 0 && status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [loading, programs, reload, status]);

  return { programs, loading: loading || refreshing, error, reload };
}

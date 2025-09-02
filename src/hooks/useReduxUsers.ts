import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { loadUsers } from "@/redux/slices/userSlice";
import { useCallback, useEffect, useState } from "react";

export function useReduxUsers() {
  const dispatch = useAppDispatch();
  const { users, loading, error, status } = useAppSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(loadUsers());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, setRefreshing]);

  useEffect(() => {
    if (!loading && users.length === 0 && status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [loading, users, reload, status]);

  return { users, loading: loading || refreshing, error, reload };
}

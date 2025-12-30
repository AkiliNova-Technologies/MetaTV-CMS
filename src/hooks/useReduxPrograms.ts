import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  loadPrograms,
  loadUserSubscriptions,
  toggleSubscription,
  getSubscriptionStatus,
  updateProgram,
  clearPrograms,
} from "@/redux/slices/programSlice";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useReduxPrograms() {
  const dispatch = useAppDispatch();
  const { 
    programs, 
    userSubscriptions, 
    loading, 
    error, 
    status,
    subscriptionLoading 
  } = useAppSelector((state) => state.program);
  
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Reload all programs
   */
  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadPrograms());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Load user's subscribed programs
   */
  const loadSubscriptions = useCallback(async () => {
    try {
      await dispatch(loadUserSubscriptions());
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    }
  }, [dispatch]);

  /**
   * Toggle subscription to a program
   */
  const subscribe = useCallback(async (programId: number) => {
    try {
      const result = await dispatch(toggleSubscription(programId));
      
      if (toggleSubscription.fulfilled.match(result)) {
        const { isSubscribed } = result.payload;
        toast.success(isSubscribed ? "Subscribed!" : "Unsubscribed");
        return result.payload;
      } else {
        toast.error("Failed to update subscription");
        return null;
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
      toast.error("Failed to update subscription");
      return null;
    }
  }, [dispatch]);

  /**
   * Check if user is subscribed to a program
   */
  const isSubscribed = useCallback(
    (programId: number): boolean => {
      return userSubscriptions.includes(programId);
    },
    [userSubscriptions]
  );

  /**
   * Get subscription status for a program (fetches from server)
   */
  const checkSubscriptionStatus = useCallback(
    async (programId: number) => {
      try {
        const result = await dispatch(getSubscriptionStatus(programId));
        
        if (getSubscriptionStatus.fulfilled.match(result)) {
          return result.payload;
        }
        return null;
      } catch (error) {
        console.error("Failed to check subscription status:", error);
        return null;
      }
    },
    [dispatch]
  );

  /**
   * Get a specific program by ID
   */
  const getProgramById = useCallback(
    (programId: number) => {
      return programs.find(p => p.id === programId);
    },
    [programs]
  );

  /**
   * Get all subscribed programs
   */
  const getSubscribedPrograms = useCallback(() => {
    return programs.filter(p => userSubscriptions.includes(p.id));
  }, [programs, userSubscriptions]);

  /**
   * Update a program in the state
   */
  const updateProgramData = useCallback(
    (programId: number, updates: any) => {
      dispatch(updateProgram({ programId, updates }));
    },
    [dispatch]
  );

  /**
   * Clear all programs (useful for logout)
   */
  const clear = useCallback(() => {
    dispatch(clearPrograms());
  }, [dispatch]);

  /**
   * Check if a specific program subscription is loading
   */
  const isSubscriptionLoading = useCallback(
    (programId: number): boolean => {
      return subscriptionLoading[programId] || false;
    },
    [subscriptionLoading]
  );

  /**
   * Auto-load programs on mount if empty
   */
  useEffect(() => {
    if (!loading && programs.length === 0 && status === 'idle') {
      const timeout = setTimeout(() => {
        reload();
      }, 1000); // Reduced from 15000 to 1000 for faster initial load
      return () => clearTimeout(timeout);
    }
  }, [loading, programs, reload, status]);

  return {
    // Data
    programs,
    userSubscriptions,
    subscribedPrograms: getSubscribedPrograms(),
    
    // State
    loading: loading || refreshing,
    error,
    status,
    subscriptionLoading,
    
    // Actions
    reload,
    loadSubscriptions,
    subscribe,
    isSubscribed,
    checkSubscriptionStatus,
    getProgramById,
    getSubscribedPrograms,
    updateProgramData,
    clear,
    isSubscriptionLoading,
  };
}
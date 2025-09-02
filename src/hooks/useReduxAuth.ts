import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { login, logout, setUser } from "@/redux/slices/authSlice";
import type { User } from "@/types/user";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state?.auth ?? {});

  const {
    user = null,
    token = null,
    isAuthenticated = false,
    loading = false,
    error = null,
  } = auth;

  const signin = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  const signout = () => {
    dispatch(logout());
  };

  const setUserData = (userData: { user: User }) => {
    dispatch(setUser(userData));
  };

  return {
    user,
    token,
    isAuthenticated,
    dispatch,
    signin,
    signout,
    setUserData,
    loading,
    error,
  };
}

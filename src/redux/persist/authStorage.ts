import { store } from "../store";
import { setUser } from "../slices/authSlice";
import localStorage from "redux-persist/es/storage";

const AUTH_KEY = "auth_state";

export const loadAuthFromStorage = async () => {
  const stored = await localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      store.dispatch(setUser(parsed));
    } catch (error) {
      console.error("Failed to parse auth state: ", error);
    }
  }
};

export const saveAuthToStorage = async () => {
  const auth = store.getState().auth;
  try {
    await localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (error) {
    console.error("Failed to save auth state: ", error);
  }
};

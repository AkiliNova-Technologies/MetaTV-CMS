import { combineReducers } from "redux";
import { persistReducer, persistStore } from 'redux-persist';
import { configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import videoReducer from "./slices/videoSlice";
import musicReducer from "./slices/musicSlice";
import livestreamReducer from "./slices/livestreamSlice";
import programReducer from "./slices/programSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  video: videoReducer,
  music: musicReducer,
  program: programReducer,
  livestream: livestreamReducer,
  // add other slices here
});

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["auth"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
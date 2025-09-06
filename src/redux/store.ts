import { combineReducers } from "redux";
import {persistReducer, persistStore} from 'redux-persist'
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import videoReducer from "./slices/videoSlice";
import musicReducer from "./slices/musicSlice";
import livestreamReducer from "./slices/livestreamSlice";
import programReducer from "./slices/programSlice";
import localStorage from "redux-persist/es/storage";


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
  storage: localStorage,
  whitelist: ["auth"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              colorText: "#fff",
              colorIcon: "#fff",
            },
          }}
        >
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

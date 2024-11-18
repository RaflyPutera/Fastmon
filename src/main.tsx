// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import RootLayout from "./rootLayout";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootLayout>
      <App />
    </RootLayout>
  </React.StrictMode>
);

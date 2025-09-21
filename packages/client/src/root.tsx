import React from "react";
import { createRoot } from "react-dom/client";
import { GlobalProviders } from "./global-providers.tsx";

const rootElement = document.getElementById("root");

if (rootElement !== null && rootElement.innerHTML === "") {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GlobalProviders />
    </React.StrictMode>,
  );
}

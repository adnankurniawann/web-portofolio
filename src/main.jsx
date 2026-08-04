import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "remixicon/fonts/remixicon.css";

import App from "./App.jsx";
import PreLoader from "./components/PreLoader.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Static gradient + grid sit beneath the WebGL canvas so the page
        reads as designed even before the 3D scene mounts. */}
    <div className="backdrop-wash" aria-hidden="true" />
    <div className="backdrop-grid" aria-hidden="true" />

    <PreLoader />
    <App />
  </StrictMode>,
);

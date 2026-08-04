import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "remixicon/fonts/remixicon.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Fixed gradient wash behind everything — the whole background now. */}
    <div className="backdrop-wash" aria-hidden="true" />
    <App />
  </StrictMode>,
);

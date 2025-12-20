import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "pagedone/src/css/pagedone.css";
import "pagedone/src/js/pagedone.js";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

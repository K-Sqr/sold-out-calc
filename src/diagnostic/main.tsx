import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import DiagnosticApp from "./DiagnosticApp";
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DiagnosticApp />
    <Analytics />
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import SnapshotApp from "./SnapshotApp";
import "../index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnapshotApp />
    <Analytics />
  </React.StrictMode>
);

import React from "react";
import "./Callout.css";

/**
 * Callout component for highlighting important info, warnings, or tips.
 * Props:
 * - type: "info" | "warning" | "success" | "error" (default: "info")
 * - children: content to display
 */
function Callout({ type = "info", children }) {
  return <div className={`callout callout-${type}`}>{children}</div>;
}

export default Callout;

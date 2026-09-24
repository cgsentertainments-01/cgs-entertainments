import React from "react";

export type EmptyStateProps = {
  title?: string;
  message?: string;
  description?: string;
  onReset?: () => void;
};

export function EmptyState({
  title = "No Data Found",
  message,
  description,
  onReset,
}: EmptyStateProps) {
  const subtext = description || message;

  return (
    <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748B" }}>
      <h3 style={{ fontSize: 19, fontWeight: 800, color: "#1E1B4B", margin: "0 0 6px" }}>{title}</h3>
      {subtext && <p style={{ fontSize: 14, margin: "0 0 16px", color: "#64748B" }}>{subtext}</p>}
      {onReset && (
        <button
          onClick={onReset}
          style={{
            padding: "8px 18px",
            borderRadius: 10,
            background: "#F3E8FF",
            color: "#6D28D9",
            border: "1.5px solid #DDD6FE",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

export default EmptyState;

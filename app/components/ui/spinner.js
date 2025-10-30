import React from "react";

export default function Spinner({ text = "Loading...", size = 32 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          borderWidth: size / 8,
          borderTopColor: "#0078d4",
        }}
      />
      <span style={{ marginLeft: 12, fontSize: 16, color: "#333" }}>
        {text}
      </span>
      <style>{`
        .spinner {
          border: 4px solid #ccc;
          border-top: 4px solid #0078d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

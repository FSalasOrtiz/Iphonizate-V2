import React from "react";

export default function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`chip ${active ? "chip-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

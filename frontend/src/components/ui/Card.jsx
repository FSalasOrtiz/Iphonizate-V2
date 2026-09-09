import React from "react";

export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || right) && (
        <div className="card-head">
          <div>
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {right && <div className="card-right">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

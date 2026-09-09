import React from "react";

export default function Empty({ icon: Icon, title, subtitle }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty-icon">
          <Icon size={20} />
        </div>
      )}
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-subtitle">{subtitle}</div>}
    </div>
  );
}

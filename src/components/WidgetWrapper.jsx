import React, { useState } from "react";

export default function WidgetWrapper({ title, children, onRemove, onRename, glassButtonStyle }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(title);

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.2)",
        position: "absolute",
        color: "black",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          gap: "12px",
          flexShrink: 0
        }}
      >
        {editing ? (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => { setEditing(false); onRename && onRename(name); }}
            onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onRename && onRename(name); } }}
            autoFocus
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "2px 4px",
              fontSize: "12px",
              flex: 1
            }}
          />
        ) : (
          <div
            style={{ fontWeight: 600, cursor: "pointer", flex: 1, fontSize: "12px" }}
            onClick={() => setEditing(true)}
          >
            {name}
          </div>
        )}
        <button 
          onClick={onRemove} 
          style={{
            ...glassButtonStyle,
            padding: "2px 6px",
            fontSize: "12px",
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ 
        flex: 1, 
        overflow: "auto", 
        minHeight: 0,
        /* Hide scrollbar for Chrome, Safari and Opera */
        WebkitScrollbarWidth: "none",
        msOverflowStyle: "none",
        /* Hide scrollbar for Firefox */
        scrollbarWidth: "none"
      }}>
        <style>
          {`
            /* Hide scrollbar for webkit browsers */
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {children}
      </div>
    </div>
  );
}
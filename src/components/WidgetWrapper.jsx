import React, { useState } from "react";

export default function WidgetWrapper({ title, children, onRemove, onRename, glassButtonStyle }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(title);

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.4)",
        //border: "1px solid #ccc",
        position: "absolute",
        width: "fit-content",
        color: "black"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          gap: "12px"   // ⬅ spacing between title and close button
        }}
      >
        {editing ? (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => { setEditing(false); onRename && onRename(name); }}
            autoFocus
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "2px 4px",
              fontSize: "12px"
            }}
          />
        ) : (
          <div
            style={{ fontWeight: 600, cursor: "pointer" }}
            onClick={() => setEditing(true)}
          >
            {name}
          </div>
        )}
        <button onClick={onRemove} style={glassButtonStyle}>✕</button>
      </div>
      {children}
    </div>
  );
}

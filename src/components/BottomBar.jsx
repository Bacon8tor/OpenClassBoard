import React from "react";

export default function BottomBar({ 
  barMinimized, 
  setBarMinimized, 
  glassButtonStyle, 
  addWidget 
}) {
  const widgetTypes = [
    "stoplight",
    "clock",
    "timer",
    "poll",
    "dice",
    "namepicker",
    "conversion"
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.25)",
        borderTop: "1px solid rgba(255,255,255,0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 6,
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: barMinimized ? 0 : 6,
          gap: 12
        }}
      >
        <button
          style={{
            ...glassButtonStyle,
            borderRadius: "20px",
            padding: "4px 10px"
          }}
          onClick={() => setBarMinimized(m => !m)}
        >
          {barMinimized ? "▲" : "▼"}
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>OpenClassScreen</span>
      </div>

      {!barMinimized && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            width: "100%"
          }}
        >
          {widgetTypes.map(t => (
            <button
              key={t}
              style={glassButtonStyle}
              onClick={() => addWidget(t)}
            >
              Add {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

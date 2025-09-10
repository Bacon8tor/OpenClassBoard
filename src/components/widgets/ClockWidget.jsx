import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function ClockWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [now, setNow] = useState(new Date());
  const { ref, getPosition } = useDraggable(position || { x: 320, y: 80 });

  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Clock" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ fontSize: "24px", fontFamily: "monospace" }}>{now.toLocaleTimeString()}</div>
        <div style={{ fontSize: "12px", color: "#555" }}>{now.toLocaleDateString()}</div>
      </WidgetWrapper>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function Stoplight({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [color, setColor] = useState("red");
  const { ref, getPosition } = useDraggable(position || { x: 80, y: 80 });
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const circleStyle = c => ({
    width: "50px", height: "50px", borderRadius: "50%", border: "2px solid #333",
    margin: "8px 0", cursor: "pointer", backgroundColor: c === color ? c : "#666"
  });

  return (
    <div ref={ref}>
      <WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ width:"70px", padding:"10px", background:"#222", border:"3px solid #333", borderRadius:"12px", display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div onClick={() => setColor("red")} style={circleStyle("red")} />
          <div onClick={() => setColor("yellow")} style={circleStyle("yellow")} />
          <div onClick={() => setColor("green")} style={circleStyle("green")} />
        </div>
        <div style={{ marginTop: "8px" }}>Active: <b>{color}</b></div>
      </WidgetWrapper>
    </div>
  );
}

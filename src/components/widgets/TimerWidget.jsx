import React, { useEffect, useRef, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function TimerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const { ref, getPosition } = useDraggable(position || { x: 80, y: 260 });
  const intervalRef = useRef(null);

  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const format = s => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const parseTime = str => {
    const p = str.split(":");
    let mm = 0, ss = 0;
    if (p.length === 2) { mm = parseInt(p[0]) || 0; ss = parseInt(p[1]) || 0; }
    else mm = parseInt(p[0]) || 0;
    return mm * 60 + ss;
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <input
          value={format(secondsLeft)}
          onChange={e => setSecondsLeft(Math.max(0, parseTime(e.target.value)))}
          style={{ fontSize: "28px", textAlign: "center", fontFamily: "monospace", width: "100px" }}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "center" }}>
          <button style={glassButtonStyle} onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
          <button style={glassButtonStyle} onClick={() => { clearInterval(intervalRef.current); setRunning(false); setSecondsLeft(0); }}>Reset</button>
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "8px", justifyContent: "center" }}>
          <button style={glassButtonStyle} onClick={() => setSecondsLeft(prev => Math.max(0, prev - 60))}>-1m</button>
          <button style={glassButtonStyle} onClick={() => setSecondsLeft(prev => prev + 60)}>+1m</button>
        </div>
      </WidgetWrapper>
    </div>
  );
}

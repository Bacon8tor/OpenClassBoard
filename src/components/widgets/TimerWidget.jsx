import React, { useEffect, useRef, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function TimerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetTransparency, hideTitles }) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const { ref, getPosition } = useDraggable(position || { x: 80, y: 260, width: 200, height: 180 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium } = useWidgetDimensions();
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

  const timerSize = fontSize(28, 16, 48);
  const buttonSize = fontSize(11, 8, 16);
  const pad = spacing(8, 4, 12);
  const gap = spacing(8, 4, 12);

  const compactButtonStyle = {
    ...glassButtonStyle,
    padding: `${spacing(6, 3, 10)}px ${spacing(10, 6, 14)}px`,
    fontSize: `${buttonSize}px`,
    flex: 1,
    minHeight: `${spacing(24, 20, 32)}px`
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Timer" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle} widgetTransparency={widgetTransparency} hideTitles={hideTitles}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: `${gap}px`,
            padding: `${pad}px`
          }}
        >
          <input
            value={format(secondsLeft)}
            onChange={e => setSecondsLeft(Math.max(0, parseTime(e.target.value)))}
            style={{ 
              fontSize: `${timerSize}px`, 
              textAlign: "center", 
              fontFamily: "monospace",
              width: "90%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: `${spacing(4, 2, 8)}px`,
              background: secondsLeft === 0 ? "#ffebee" : "white",
              color: secondsLeft === 0 ? "#d32f2f" : "black",
              fontWeight: "bold"
            }}
          />
          
          <div style={{ 
            display: "flex", 
            gap: `${spacing(6, 3, 10)}px`, 
            width: "100%",
            flexDirection: isSmall ? "column" : "row"
          }}>
            <button 
              style={{
                ...compactButtonStyle,
                background: running ? "rgba(255,193,7,0.8)" : "rgba(76,175,80,0.8)"
              }} 
              onClick={() => setRunning(r => !r)}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button 
              style={{
                ...compactButtonStyle,
                background: "rgba(244,67,54,0.8)"
              }} 
              onClick={() => { 
                clearInterval(intervalRef.current); 
                setRunning(false); 
                setSecondsLeft(0); 
              }}
            >
              Reset
            </button>
          </div>
          
          {!isSmall && (
            <div style={{ 
              display: "flex", 
              gap: `${spacing(4, 2, 8)}px`, 
              width: "100%"
            }}>
              <button 
                style={{
                  ...compactButtonStyle,
                  fontSize: `${fontSize(10, 7, 14)}px`,
                  padding: `${spacing(4, 2, 6)}px`
                }} 
                onClick={() => setSecondsLeft(prev => Math.max(0, prev - 60))}
              >
                -1min
              </button>
              <button 
                style={{
                  ...compactButtonStyle,
                  fontSize: `${fontSize(10, 7, 14)}px`,
                  padding: `${spacing(4, 2, 6)}px`
                }} 
                onClick={() => setSecondsLeft(prev => prev + 60)}
              >
                +1min
              </button>
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
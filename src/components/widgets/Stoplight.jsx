import React, { useState, useEffect } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function Stoplight({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetTransparency, hideTitles }) {
  const [color, setColor] = useState("red");
  const { ref, getPosition } = useDraggable(position || { x: 80, y: 80, width: 140, height: 280 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium, dimensions } = useWidgetDimensions();
  
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  // Calculate sizes based on widget dimensions
  const availableHeight = Math.max(120, dimensions.height - 80); // Space for lights
  const availableWidth = Math.max(80, dimensions.width - 32); // Available width
  
  // Scale circle size based on both dimensions, but prioritize fitting in width
  const maxCircleByWidth = Math.min(80, availableWidth * 0.6); // 60% of width
  const maxCircleByHeight = Math.min(80, availableHeight / 5); // Height for 3 circles + spacing
  const circleSize = Math.max(25, Math.min(maxCircleByWidth, maxCircleByHeight));
  
  // Housing scales with circle size
  const lightBoxWidth = Math.max(circleSize * 1.4, circleSize + 24);
  const lightBoxPadding = Math.max(8, circleSize * 0.2);
  const gap = Math.max(4, circleSize * 0.15);
  
  // Calculate total housing height needed
  const housingHeight = (circleSize * 3) + (gap * 4) + (lightBoxPadding * 2);
  
  const statusSize = fontSize(14, 10, 18);
  const pad = spacing(6, 4, 10);

  const circleStyle = (lightColor, isActive) => ({
    width: `${circleSize}px`, 
    height: `${circleSize}px`, 
    borderRadius: "50%", 
    border: `${Math.max(1, circleSize/30)}px solid #111`,
    margin: `${gap}px 0`, 
    cursor: "pointer", 
    backgroundColor: isActive ? lightColor : "#333",
    boxShadow: isActive ? 
      `0 0 ${circleSize * 0.4}px ${lightColor}, 0 0 ${circleSize * 0.2}px ${lightColor} inset, 0 ${circleSize * 0.05}px ${circleSize * 0.1}px rgba(0,0,0,0.3)` : 
      `inset 0 ${circleSize * 0.05}px ${circleSize * 0.1}px rgba(0,0,0,0.5), 0 ${circleSize * 0.02}px ${circleSize * 0.05}px rgba(0,0,0,0.3)`,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    opacity: isActive ? 1 : 0.4
  });

  const lightColors = [
    { name: "red", color: "#ff2222", label: "Stop" },
    { name: "yellow", color: "#ffcc00", label: "Caution" },
    { name: "green", color: "#22ff22", label: "Go" }
  ];

  return (
    <div ref={ref}>
      <WidgetWrapper title="Stoplight" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle} widgetTransparency={widgetTransparency} hideTitles={hideTitles}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: `${Math.max(4, spacing(6, 4, 10))}px`,
            padding: `${pad}px`
          }}
        >
          
          {/* Traffic light housing - scales with widget */}
          <div style={{
            width: `${lightBoxWidth}px`,
            height: `${housingHeight}px`,
            padding: `${lightBoxPadding}px`,
            background: `linear-gradient(145deg, #1a1a1a, #2d2d2d)`,
            border: `${Math.max(1, lightBoxWidth/60)}px solid #000`,
            borderRadius: `${Math.max(8, lightBoxWidth * 0.12)}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            boxShadow: `
              0 ${Math.max(4, lightBoxWidth * 0.08)}px ${Math.max(8, lightBoxWidth * 0.15)}px rgba(0,0,0,0.4), 
              inset 0 ${Math.max(1, lightBoxWidth * 0.02)}px ${Math.max(2, lightBoxWidth * 0.04)}px rgba(255,255,255,0.1),
              inset 0 -${Math.max(1, lightBoxWidth * 0.02)}px ${Math.max(2, lightBoxWidth * 0.04)}px rgba(0,0,0,0.3)
            `,
            position: "relative",
            flex: "0 0 auto" // Don't grow or shrink
          }}>
            
            {/* Mounting bracket at top - scales with housing */}
            <div style={{
              position: "absolute",
              top: `-${Math.max(6, lightBoxWidth * 0.1)}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${Math.max(16, lightBoxWidth * 0.3)}px`,
              height: `${Math.max(12, lightBoxWidth * 0.2)}px`,
              background: "linear-gradient(145deg, #333, #555)",
              borderRadius: `${Math.max(2, lightBoxWidth * 0.03)}px`,
              border: `${Math.max(1, lightBoxWidth/80)}px solid #111`,
              boxShadow: `0 ${Math.max(2, lightBoxWidth * 0.04)}px ${Math.max(4, lightBoxWidth * 0.08)}px rgba(0,0,0,0.4)`
            }} />
            
            {/* Side mounting bolts */}
            {lightBoxWidth > 60 && (
              <>
                <div style={{
                  position: "absolute",
                  left: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  top: `${Math.max(8, lightBoxWidth * 0.15)}px`,
                  width: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  height: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  background: "#444",
                  borderRadius: "50%",
                  border: "1px solid #222"
                }} />
                <div style={{
                  position: "absolute",
                  right: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  top: `${Math.max(8, lightBoxWidth * 0.15)}px`,
                  width: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  height: `${Math.max(4, lightBoxWidth * 0.08)}px`,
                  background: "#444",
                  borderRadius: "50%",
                  border: "1px solid #222"
                }} />
              </>
            )}
            
            {lightColors.map(light => {
              const isActive = light.name === color;
              return (
                <div 
                  key={light.name}
                  onClick={() => setColor(light.name)} 
                  style={circleStyle(light.color, isActive)}
                >
                  {/* Active light glow effect - scales with circle */}
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      width: "75%",
                      height: "75%",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)`,
                      animation: "pulse 2.5s infinite",
                      pointerEvents: "none"
                    }} />
                  )}
                  
                  {/* Light reflection - for larger circles */}
                  {circleSize > 35 && (
                    <div style={{
                      position: "absolute",
                      top: `${circleSize * 0.15}px`,
                      left: `${circleSize * 0.2}px`,
                      width: `${circleSize * 0.3}px`,
                      height: `${circleSize * 0.25}px`,
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      pointerEvents: "none"
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Status display - only show if there's space */}
          {dimensions.height > housingHeight + 100 && (
            <div style={{ 
              textAlign: "center",
              flexShrink: 0
            }}>
              <div style={{ 
                fontSize: `${statusSize}px`,
                fontWeight: "bold",
                color: "#333",
                marginBottom: `${spacing(4, 2, 6)}px`
              }}>
                <span style={{ color: color }}>{color.toUpperCase()}</span>
              </div>
              
              {/* Action buttons for medium/large widgets with enough space */}
              {isMedium && dimensions.height > housingHeight + 140 && (
                <div style={{
                  display: "flex",
                  gap: `${spacing(3, 2, 6)}px`,
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  {lightColors.map(light => (
                    <button
                      key={light.name}
                      onClick={() => setColor(light.name)}
                      style={{
                        ...glassButtonStyle,
                        padding: `${spacing(3, 2, 5)}px ${spacing(6, 4, 10)}px`,
                        fontSize: `${fontSize(9, 7, 11)}px`,
                        background: light.name === color ? 
                          `${light.color}dd` :
                          "rgba(200,200,200,0.6)",
                        color: light.name === color ? "white" : "#333",
                        fontWeight: light.name === color ? "bold" : "normal",
                        border: light.name === color ? `1px solid ${light.color}` : "1px solid #ccc",
                        textShadow: light.name === color ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
                      }}
                    >
                      {light.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add CSS animation for pulse effect */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.02); }
              100% { opacity: 0.8; transform: scale(1); }
            }
          `}
        </style>
      </WidgetWrapper>
    </div>
  );
}
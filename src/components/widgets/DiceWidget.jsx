import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function DiceWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetTransparency, hideTitles }) {
  const { ref, getPosition } = useDraggable(position || { x: 400, y: 200, width: 220, height: 250 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium, dimensions } = useWidgetDimensions();
  
  useEffect(() => {
    if (registerRef) registerRef(getPosition);
  }, [getPosition, registerRef]);

  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(6);
  const [values, setValues] = useState([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    // Animation sequence
    let animationCycles = 0;
    const maxCycles = 15; // Number of animation frames
    const animationInterval = setInterval(() => {
      // Show random values during animation
      const tempValues = Array.from({ length: diceCount }, () =>
        Math.floor(Math.random() * diceSides) + 1
      );
      setValues(tempValues);
      animationCycles++;
      
      if (animationCycles >= maxCycles) {
        clearInterval(animationInterval);
        
        // Final roll values
        const finalValues = Array.from({ length: diceCount }, () =>
          Math.floor(Math.random() * diceSides) + 1
        );
        setValues(finalValues);
        setIsRolling(false);
        
        // Add to history (keep last 5 rolls)
        const rollSum = finalValues.reduce((sum, val) => sum + val, 0);
        setRollHistory(prev => [
          { values: [...finalValues], sum: rollSum, timestamp: Date.now() },
          ...prev.slice(0, 4)
        ]);
      }
    }, 80); // Animation speed
  };

  const clearHistory = () => {
    setRollHistory([]);
  };

  // Calculate responsive sizes based on widget dimensions
  const avgDimension = (dimensions.width + dimensions.height) / 2;
  const baseSize = Math.max(150, Math.min(400, avgDimension));
  
  // Scale dice size dynamically based on widget size
  const diceDisplaySize = Math.max(20, Math.min(120, baseSize * 0.2));
  const individualDiceSize = Math.max(16, Math.min(80, diceDisplaySize / Math.max(1, Math.sqrt(diceCount))));
  
  const buttonSize = fontSize(12, 10, 16);
  const totalSize = fontSize(10, 8, 12);
  const historySize = fontSize(9, 7, 11);
  const pad = spacing(8, 4, 12);
  const gap = spacing(8, 4, 12);

  const compactButtonStyle = {
    ...glassButtonStyle,
    padding: `${spacing(4, 2, 8)}px ${spacing(8, 4, 12)}px`,
    fontSize: `${fontSize(11, 8, 14)}px`
  };

  // Style for individual dice display
  const diceStyle = (value) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${individualDiceSize}px`,
    height: `${individualDiceSize}px`,
    margin: `${Math.max(2, individualDiceSize * 0.05)}px`,
    backgroundColor: isRolling ? "#fff3cd" : "#ffffff",
    border: `${Math.max(1, individualDiceSize * 0.02)}px solid ${isRolling ? "#ffc107" : "#dee2e6"}`,
    borderRadius: `${Math.max(3, individualDiceSize * 0.1)}px`,
    fontSize: `${Math.max(8, individualDiceSize * 0.4)}px`,
    fontWeight: "bold",
    color: isRolling ? "#856404" : "#212529",
    boxShadow: isRolling ? 
      `0 ${Math.max(1, individualDiceSize * 0.05)}px ${Math.max(2, individualDiceSize * 0.1)}px rgba(255,193,7,0.3)` :
      `0 ${Math.max(1, individualDiceSize * 0.03)}px ${Math.max(2, individualDiceSize * 0.06)}px rgba(0,0,0,0.15)`,
    transform: isRolling ? `scale(${1 + Math.sin(Date.now() * 0.01) * 0.1})` : "scale(1)",
    transition: isRolling ? "none" : "all 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif"
  });

  return (
    <div ref={ref}>
      <WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle} widgetTransparency={widgetTransparency} hideTitles={hideTitles}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            gap: `${gap}px`,
            padding: `${pad}px`
          }}
        >
          
          <div style={{ 
            display: "flex", 
            flexDirection: isSmall ? "column" : "row", 
            gap: `${spacing(4, 2, 8)}px`,
            fontSize: `${fontSize(11, 8, 14)}px`,
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: `${spacing(4, 2, 6)}px` }}>
              <label style={{ minWidth: isSmall ? "auto" : "35px" }}>Count:</label>
              <input
                type="number"
                min="1"
                max="12"
                value={diceCount}
                disabled={isRolling}
                style={{ 
                  width: isSmall ? "40px" : "50px", 
                  fontSize: `${fontSize(11, 8, 14)}px`, 
                  padding: `${spacing(2, 1, 4)}px`,
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  opacity: isRolling ? 0.6 : 1
                }}
                onChange={(e) => {
                  const count = Math.max(1, Math.min(12, parseInt(e.target.value) || 1));
                  setDiceCount(count);
                  setValues(Array(count).fill(1));
                }}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: `${spacing(4, 2, 6)}px` }}>
              <label style={{ minWidth: isSmall ? "auto" : "35px" }}>Sides:</label>
              <input
                type="number"
                min="2"
                max="100"
                value={diceSides}
                disabled={isRolling}
                style={{ 
                  width: isSmall ? "40px" : "50px", 
                  fontSize: `${fontSize(11, 8, 14)}px`, 
                  padding: `${spacing(2, 1, 4)}px`,
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  opacity: isRolling ? 0.6 : 1
                }}
                onChange={(e) => {
                  const sides = Math.max(2, Math.min(100, parseInt(e.target.value) || 6));
                  setDiceSides(sides);
                }}
              />
            </div>
          </div>
          
          {/* Dice Display Area */}
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            minHeight: "60px",
            backgroundColor:  "rgba(255,193,7,0.1)" ,
            borderRadius: "12px",
            border: `2px ${isRolling ? "dashed" : "solid"} ${isRolling ? "rgba(255,193,7,0.4)" : "rgba(0,0,0,0.1)"}`,
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            padding: `${spacing(8, 4, 16)}px`
          }}>
            {/* Rolling background effect */}
            {isRolling && (
              <div style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,193,7,0.2), transparent)",
                animation: "shimmer 0.8s infinite"
              }} />
            )}
            
            {/* Individual Dice */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: `${Math.max(2, individualDiceSize * 0.05)}px`,
              zIndex: 1,
              maxWidth: "100%"
            }}>
              {values.map((value, index) => (
                <div key={index} style={diceStyle(value)}>
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ flexShrink: 0 }}>
            <button 
              style={{
                ...compactButtonStyle,
                width: "100%",
                padding: `${spacing(8, 4, 12)}px`,
                fontSize: `${buttonSize}px`,
                background: isRolling ? "rgba(255,193,7,0.8)" : "rgba(76,175,80,0.8)",
                fontWeight: "bold",
                cursor: isRolling ? "not-allowed" : "pointer",
                transform: isRolling ? "scale(0.98)" : "scale(1)",
                transition: "all 0.1s ease"
              }} 
              onClick={rollDice}
              disabled={isRolling}
            >
              {isRolling ? "🎲 Rolling..." : `🎲 Roll ${isSmall && diceCount > 1 ? `${diceCount}d${diceSides}` : "Dice"}`}
            </button>
          </div>
          
          {values.length > 1 && (
            <div style={{ 
              fontSize: `${totalSize}px`, 
              textAlign: "center", 
              color: "#666",
              flexShrink: 0,
              fontWeight: "bold"
            }}>
              Total: {values.reduce((sum, val) => sum + val, 0)}
              {!isSmall && (
                <span style={{ marginLeft: `${spacing(8, 4, 12)}px`, fontWeight: "normal" }}>
                  (Average: {(values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)})
                </span>
              )}
            </div>
          )}

          {/* Roll History for larger widgets */}
          {!isSmall && rollHistory.length > 0 && (
            <div style={{
              flexShrink: 0,
              borderTop: "1px solid rgba(0,0,0,0.1)",
              paddingTop: `${spacing(4, 2, 6)}px`
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: `${spacing(4, 2, 6)}px`
              }}>
                <span style={{ 
                  fontSize: `${historySize}px`, 
                  fontWeight: "bold", 
                  color: "#fff" 
                }}>
                  Recent Rolls:
                </span>
                <button
                  onClick={clearHistory}
                  style={{
                    ...compactButtonStyle,
                    padding: `${spacing(2, 1, 4)}px ${spacing(4, 2, 6)}px`,
                    fontSize: `${historySize}px`,
                    background: "rgba(244,67,54,0.6)"

                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ 
                maxHeight: "60px", 
                overflowY: "auto",
                fontSize: `${historySize}px`,
                color: "#888"
              }}>
                {rollHistory.map((roll, index) => (
                  <div key={roll.timestamp} style={{ 
                    marginBottom: `${spacing(2, 1, 3)}px`,
                    opacity: 1 - (index * 0.2),
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color:"#fff"
                  }}>
                    <span>
                      [{roll.values.join(", ")}] = {roll.sum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 100%; }
            }
          `}
        </style>
      </WidgetWrapper>
    </div>
  );
}
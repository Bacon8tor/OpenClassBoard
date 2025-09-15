import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function NamePickerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 400, y: 300, width: 260, height: 240 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium } = useWidgetDimensions();
  
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [names, setNames] = useState(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  const [selected, setSelected] = useState("");
  const [uniquePick, setUniquePick] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editingNames, setEditingNames] = useState("");

  // Initialize editing names from current names
  useEffect(() => {
    setEditingNames(names.join(", "));
  }, []);

  const pick = () => {
    if (names.length === 0) return;
    
    setIsAnimating(true);
    
    // Animation effect - cycle through names
    let cycles = 0;
    const maxCycles = 10;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * names.length);
      setSelected(names[randomIdx]);
      cycles++;
      
      if (cycles >= maxCycles) {
        clearInterval(interval);
        
        // Final selection
        const finalIdx = Math.floor(Math.random() * names.length);
        const picked = names[finalIdx];
        setSelected(picked);
        setIsAnimating(false);
        
        if (uniquePick) {
          setNames(prev => prev.filter((_, i) => i !== finalIdx));
        }
      }
    }, 100);
  };

  const resetNames = () => {
    const defaultNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
    setNames(defaultNames);
    setEditingNames(defaultNames.join(", "));
    setSelected("");
  };

  const updateNames = () => {
    const newNames = editingNames
      .split(",")
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (newNames.length > 0) {
      setNames(newNames);
      setSelected("");
    }
  };

  // Calculate responsive sizes
  const labelSize = fontSize(12, 9, 15);
  const inputSize = fontSize(11, 8, 14);
  const selectedSize = fontSize(20, 14, 32);
  const buttonSize = fontSize(12, 9, 16);
  const pad = spacing(8, 4, 12);
  const gap = spacing(6, 3, 10);

  const buttonStyle = {
    ...glassButtonStyle,
    padding: `${spacing(6, 4, 10)}px ${spacing(12, 8, 16)}px`,
    fontSize: `${buttonSize}px`,
    fontWeight: "bold"
  };

  const pickButtonStyle = {
    ...buttonStyle,
    background: isAnimating ? "rgba(255,193,7,0.8)" : "rgba(76,175,80,0.8)",
    flex: 1
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Name Picker" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            gap: `${gap}px`,
            padding: `${pad}px`,
            fontSize: `${labelSize}px`
          }}
        >
          
          {/* Names input section */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ 
              fontSize: `${inputSize}px`,
              fontWeight: "bold",
              display: "block",
              marginBottom: `${spacing(4, 2, 6)}px`
            }}>
              Names (comma separated):
            </label>
            <textarea
              value={editingNames}
              onChange={e => setEditingNames(e.target.value)}
              onBlur={updateNames}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) updateNames(); }}
              placeholder="Enter names separated by commas..."
              style={{ 
                width: "100%",
                fontSize: `${inputSize}px`,
                padding: `${spacing(4, 2, 6)}px`,
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "none",
                height: isSmall ? "40px" : "60px",
                boxSizing: "border-box"
              }}
            />
            {!isSmall && (
              <div style={{
                fontSize: `${fontSize(9, 7, 11)}px`,
                color: "#666",
                marginTop: `${spacing(2, 1, 3)}px`
              }}>
                Ctrl+Enter to update • {names.length} names available
              </div>
            )}
          </div>

          {/* Selection display */}
          <div style={{ 
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: selected ? "rgba(255, 255, 255, 0.81)" : "rgba(200, 200, 200, 0.54)",
            borderRadius: "8px",
            border: `2px ${isAnimating ? "dashed" : "solid"} ${selected ? "rgba(76,175,80,0.4)" : "rgba(200,200,200,0.4)"}`,
            padding: `${spacing(8, 4, 16)}px`,
            textAlign: "center",
            minHeight: `${spacing(60, 40, 80)}px`,
            transition: "all 0.3s ease"
          }}>
            <div>
              <div style={{ 
                fontSize: `${fontSize(10, 8, 12)}px`,
                color: "#666",
                marginBottom: `${spacing(4, 2, 6)}px`,
                fontWeight: "bold"
              }}>
                {selected ? "Selected:" : "Click Pick to select a name"}
              </div>
              
              <div style={{ 
                fontSize: `${selectedSize}px`,
                fontWeight: "bold",
                color: selected ? "#2e7d32" : "#999",
                fontFamily: "system-ui",
                lineHeight: "1.2",
                animation: isAnimating ? "bounce 0.1s infinite alternate" : "none"
              }}>
                {selected || "?"}
              </div>
              
              {selected && !isSmall && (
                <div style={{
                  fontSize: `${fontSize(10, 8, 12)}px`,
                  color: "#666",
                  marginTop: `${spacing(4, 2, 6)}px`
                }}>
                  🎉 Good luck, {selected}!
                </div>
              )}
            </div>
          </div>

          {/* Controls section */}
          <div style={{ 
            flexShrink: 0,
            display: "flex",
            flexDirection: isSmall ? "column" : "row",
            gap: `${gap}px`
          }}>
            <button 
              style={pickButtonStyle}
              onClick={pick}
              disabled={names.length === 0 || isAnimating}
            >
              {isAnimating ? "🎲 Picking..." : "🎲 Pick Name"}
            </button>
            
            <button 
              style={{
                ...buttonStyle,
                background: "rgba(244,67,54,0.8)",
                flex: isSmall ? 1 : "0 0 auto"
              }}
              onClick={resetNames}
            >
              Reset
            </button>
          </div>

          {/* Options */}
          <div style={{ 
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: `${spacing(6, 3, 8)}px`,
            fontSize: `${fontSize(11, 8, 13)}px`
          }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: `${spacing(4, 2, 6)}px`,
              cursor: "pointer"
            }}>
              <input 
                type="checkbox" 
                checked={uniquePick} 
                onChange={e => setUniquePick(e.target.checked)}
                style={{ transform: `scale(${isSmall ? 0.8 : 1})` }}
              />
              <span>Remove picked names</span>
            </label>
          </div>

          {/* Stats for larger widgets */}
          {!isSmall && (
            <div style={{
              fontSize: `${fontSize(9, 7, 11)}px`,
              color: "#888",
              textAlign: "center",
              flexShrink: 0,
              paddingTop: `${spacing(4, 2, 6)}px`,
              borderTop: "1px solid rgba(0,0,0,0.1)"
            }}>
              {names.length} names remaining
              {uniquePick && " • Unique mode active"}
            </div>
          )}
        </div>

        {/* Animation styles */}
        <style>
          {`
            @keyframes bounce {
              0% { transform: translateY(0); }
              100% { transform: translateY(-5px); }
            }
          `}
        </style>
      </WidgetWrapper>
    </div>
  );
}
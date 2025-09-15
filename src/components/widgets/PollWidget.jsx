import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function PollWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 200, y: 260, width: 280, height: 320 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium } = useWidgetDimensions();
  
  useEffect(() => { 
    if (registerRef) registerRef(getPosition); 
  }, [getPosition, registerRef]);

  const [options, setOptions] = useState(["A", "B", "C"]);
  const [votes, setVotes] = useState({});
  const [newOption, setNewOption] = useState("");
  const [editValues, setEditValues] = useState({});

  // Vote for an option
  const vote = opt => setVotes(v => ({ ...v, [opt]: (v[opt] || 0) + 1 }));

  // Add new option
  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions(prev => [...prev, trimmed]);
      setNewOption("");
    }
  };

  // Apply option rename
  const applyRename = (oldName) => {
    const newName = (editValues[oldName] || "").trim();
    if (!newName || newName === oldName || options.includes(newName)) return;

    setOptions(prev => prev.map(o => (o === oldName ? newName : o)));
    setVotes(prev => {
      const { [oldName]: oldVotes, ...rest } = prev;
      return { ...rest, [newName]: oldVotes || 0 };
    });
    setEditValues(prev => {
      const { [oldName]: _, ...rest } = prev;
      return rest;
    });
  };

  // Delete an option
  const deleteOption = opt => {
    setOptions(prev => prev.filter(o => o !== opt));
    setVotes(prev => {
      const { [opt]: _, ...rest } = prev;
      return rest;
    });
    setEditValues(prev => {
      const { [opt]: _, ...rest } = prev;
      return rest;
    });
  };

  // Calculate scaled sizes
  const buttonSize = fontSize(11, 8, 14);
  const textSize = fontSize(12, 9, 15);
  const inputSize = fontSize(10, 8, 12);
  const pad = spacing(8, 4, 12);
  const gap = spacing(4, 2, 8);

  // Button styles
  const compactButtonStyle = {
    ...glassButtonStyle,
    padding: `${spacing(4, 2, 8)}px ${spacing(8, 4, 12)}px`,
    fontSize: `${buttonSize}px`,
    minHeight: `${spacing(24, 20, 32)}px`
  };

  const voteButtonStyle = {
    ...compactButtonStyle,
    flex: "0 0 auto",
    minWidth: isSmall ? "30px" : "40px",
    background: "rgba(33, 150, 243, 0.8)",
    fontWeight: "bold"
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%", 
            gap: `${gap}px`,
            fontSize: `${textSize}px`,
            padding: `${pad}px`
          }}
        >
          {/* Options list */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            paddingRight: "2px",
            minHeight: 0
          }}>
            {options.map(o => {
              const voteCount = votes[o] || 0;
              const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              
              return (
                <div key={o} style={{ 
                  margin: `${spacing(2, 1, 4)}px 0`, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: `${gap}px`,
                  flexWrap: isSmall ? "wrap" : "nowrap",
                  position: "relative",
                  background: voteCount > 0 ? `linear-gradient(90deg, rgba(33, 150, 243, 0.2) ${percentage}%, transparent ${percentage}%)` : "transparent",
                  borderRadius: "4px",
                  padding: `${spacing(2, 1, 3)}px`
                }}>
                  {/* Vote button */}
                  <button 
                    style={voteButtonStyle}
                    onClick={() => vote(o)}
                  >
                    {isSmall ? o.charAt(0) : o}
                  </button>
                  
                  {/* Vote count display */}
                  <span style={{ 
                    fontSize: `${inputSize}px`, 
                    flex: "0 0 auto",
                    minWidth: isSmall ? "35px" : "55px",
                    fontWeight: "bold",
                    color: voteCount > 0 ? "#1976d2" : "#666"
                  }}>
                    {voteCount} {isSmall ? "" : "votes"}
                    {!isSmall && totalVotes > 0 && (
                      <span style={{ fontSize: `${fontSize(9, 7, 11)}px`, color: "#888" }}>
                        ({percentage}%)
                      </span>
                    )}
                  </span>
                  
                  {/* Edit input (hidden on small widgets) */}
                  {!isSmall && (
                    <input
                      type="text"
                      value={editValues[o] !== undefined ? editValues[o] : o}
                      onChange={e => setEditValues(prev => ({ ...prev, [o]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") applyRename(o); }}
                      style={{ 
                        flex: "1 1 60px",
                        minWidth: "60px",
                        fontSize: `${inputSize}px`,
                        padding: `${spacing(2, 1, 4)}px`,
                        border: "1px solid #ccc",
                        borderRadius: "3px"
                      }}
                    />
                  )}
                  
                  {/* Delete button */}
                  <button 
                    style={{
                      ...compactButtonStyle,
                      padding: `${spacing(2, 1, 4)}px ${spacing(6, 3, 8)}px`,
                      minWidth: "20px",
                      background: "rgba(244, 67, 54, 0.8)"
                    }} 
                    onClick={() => deleteOption(o)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Add new option section */}
          <div style={{ 
            flexShrink: 0,
            display: "flex",
            gap: `${gap}px`,
            alignItems: "center"
          }}>
            <input
              value={newOption}
              onChange={e => setNewOption(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addOption(); }}
              placeholder={isSmall ? "New..." : "New option"}
              style={{ 
                flex: 1,
                fontSize: `${inputSize}px`,
                padding: `${spacing(3, 2, 6)}px`,
                border: "1px solid #ccc",
                borderRadius: "3px",
                minWidth: isSmall ? "60px" : "80px"
              }}
            />
            <button 
              style={{
                ...compactButtonStyle,
                flexShrink: 0,
                background: "rgba(76, 175, 80, 0.8)"
              }} 
              onClick={addOption}
            >
              {isSmall ? "+" : "Add"}
            </button>
          </div>
          
          {/* Total votes summary */}
          {Object.values(votes).some(v => v > 0) && (
            <div style={{
              fontSize: `${fontSize(10, 8, 12)}px`,
              color: "#666",
              textAlign: "center",
              flexShrink: 0,
              paddingTop: `${spacing(4, 2, 6)}px`,
              borderTop: "1px solid rgba(0,0,0,0.1)"
            }}>
              Total votes: {Object.values(votes).reduce((sum, v) => sum + v, 0)}
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
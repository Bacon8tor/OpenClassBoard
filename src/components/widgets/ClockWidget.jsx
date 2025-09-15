import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function ClockWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const [now, setNow] = useState(new Date());
  const { ref, getPosition } = useDraggable(position || { x: 320, y: 80, width: 200, height: 120 });
  const { ref: contentRef, fontSize, spacing, isSmall, dimensions } = useWidgetDimensions();

  useEffect(() => { 
    if (registerRef) registerRef(getPosition); 
  }, [getPosition, registerRef]);
  
  useEffect(() => { 
    const t = setInterval(() => setNow(new Date()), 1000); 
    return () => clearInterval(t); 
  }, []);

  // Calculate available space more aggressively
  const headerHeight = 32; // Approximate header height
  const paddingTotal = 16; // Total padding (8px each side)
  const availableHeight = Math.max(60, dimensions.height - headerHeight - paddingTotal);
  const availableWidth = Math.max(120, dimensions.width - paddingTotal);
  
  // Much more aggressive sizing - use most of the space
  // For time: use 60-80% of available height, constrained by width
  const maxTimeByHeight = availableHeight * 0.75;
  const maxTimeByWidth = availableWidth * 0.18; // Increased from 0.12
  
  // Minimum readable size is higher, maximum uses more space
  const timeSize = Math.max(16, Math.min(120, Math.min(maxTimeByHeight, maxTimeByWidth)));
  
  // Date size is larger relative to time size
  const dateSize = Math.max(10, Math.min(40, timeSize * 0.5));
  
  // Minimal padding to maximize content space
  const pad = Math.max(4, Math.min(12, spacing(6, 4, 8)));
  const gap = Math.max(2, timeSize * 0.08);

  // Format time based on available space and time size
  const formatTime = (date) => {
    if (timeSize < 20) {
      // Compact format for small sizes
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (timeSize < 30) {
      // Medium format
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }).replace(' ', '');
    } else {
      // Full format for larger widgets
      return date.toLocaleTimeString();
    }
  };

  const formatDate = (date) => {
    if (dateSize < 12) {
      // Very compact date
      return date.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    } else if (dateSize < 18) {
      // Medium compact date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      // Full date
      return date.toLocaleDateString();
    }
  };

  // Show additional info only if there's enough space after time and date
  const spaceUsedByTime = timeSize * 1.2; // Time + line height
  const spaceUsedByDate = dateSize * 1.2; // Date + line height
  const spaceUsedByGap = gap * 2;
  const remainingSpace = availableHeight - spaceUsedByTime - spaceUsedByDate - spaceUsedByGap;
  
  const showWeekday = remainingSpace > 20 && timeSize > 35;
  const showTimezone = remainingSpace > 40 && timeSize > 50;

  return (
    <div ref={ref}>
      <WidgetWrapper title="Clock" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div 
          ref={contentRef}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            padding: `${pad}px`,
            gap: `${gap}px`,
            overflow: "hidden"
          }}
        >
          {/* Time Display - Takes up most space */}
          <div style={{ 
            fontSize: `${timeSize}px`, 
            fontFamily: "system-ui, -apple-system, 'Segoe UI', monospace",
            fontWeight: timeSize > 25 ? "700" : "600",
            lineHeight: "0.95", // Tighter line height for more space
            whiteSpace: "nowrap",
            color: timeSize > 30 ? "#1a365d" : "#2d3748",
            textShadow: timeSize > 30 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
            background: timeSize > 40 ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "none",
            backgroundClip: timeSize > 40 ? "text" : "initial",
            WebkitBackgroundClip: timeSize > 40 ? "text" : "initial",
            WebkitTextFillColor: timeSize > 40 ? "transparent" : "inherit",
            padding: timeSize > 35 ? `${Math.max(2, timeSize * 0.04)}px ${Math.max(4, timeSize * 0.08)}px` : "0",
            borderRadius: timeSize > 35 ? `${Math.max(4, timeSize * 0.06)}px` : "0",
           // border: timeSize > 35 ? "2px solid rgba(102, 126, 234, 0.15)" : "none",
            backgroundColor: timeSize > 35 ? "rgba(255,255,255,0.6)" : "transparent",
            transform: timeSize > 25 ? "scaleY(1.05)" : "none" // Slightly stretch for better space usage
          }}>
            {formatTime(now)}
          </div>

          {/* Date Display - Compact but visible */}
          <div style={{ 
            fontSize: `${dateSize}px`, 
            color: "#4a5568",
            lineHeight: "0.9",
            whiteSpace: "nowrap",
            fontWeight: dateSize > 16 ? "500" : "400",
            letterSpacing: dateSize > 16 ? "0.3px" : "normal",
            marginTop: `-${gap * 0.3}px` // Reduce gap to save space
          }}>
            {formatDate(now)}
          </div>

          {/* Weekday for larger widgets */}
          {showWeekday && (
            <div style={{
              fontSize: `${Math.max(8, timeSize * 0.2)}px`,
              color: "#718096",
              fontWeight: "400",
              textAlign: "center",
              lineHeight: "1",
              marginTop: `-${gap * 0.2}px`
            }}>
              {now.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          )}

          {/* Time zone for very large widgets */}
          {showTimezone && (
            <div style={{
              fontSize: `${Math.max(8, timeSize * 0.15)}px`,
              color: "#a0aec0",
              fontWeight: "300",
              textAlign: "center",
              lineHeight: "1"
            }}>
              {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
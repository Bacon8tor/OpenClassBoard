import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function ClockWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetData, widgetTransparency, hideTitles }) {
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [colors, setColors] = useState(
    widgetData?.colors || {
      timeColor: "#1a365d",
      dateColor: "#4a5568",
      weekdayColor: "#718096",
      timezoneColor: "#a0aec0"
    }
  );
  const { ref, getPosition } = useDraggable(position || { x: 320, y: 80, width: 200, height: 120 });
  const { ref: contentRef, fontSize, spacing, isSmall, dimensions } = useWidgetDimensions();

  useEffect(() => {
    if (registerRef) {
      registerRef(() => {
        const pos = getPosition();
        return { ...pos, colors };
      });
    }
  }, [getPosition, registerRef, colors]);
  
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
      <WidgetWrapper
        title="Clock"
        onRemove={onRemove}
        onRename={onRename}
        glassButtonStyle={glassButtonStyle}
        widgetTransparency={widgetTransparency}
        hideTitles={hideTitles}
        extraButton={
          <button
            style={{
              ...glassButtonStyle,
              fontSize: "12px",
              padding: "4px 8px",
              marginLeft: "4px"
            }}
            onClick={() => setShowSettings(!showSettings)}
          >
            🎨
          </button>
        }
      >
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
            color: colors.timeColor,
            textShadow: timeSize > 30 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
            padding: "0",
            borderRadius: "0",
            backgroundColor: "transparent",
            transform: timeSize > 25 ? "scaleY(1.05)" : "none" // Slightly stretch for better space usage
          }}>
            {formatTime(now)}
          </div>

          {/* Date Display - Compact but visible */}
          <div style={{ 
            fontSize: `${dateSize}px`, 
            color: colors.dateColor,
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
              color: colors.weekdayColor,
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
              color: colors.timezoneColor,
              fontWeight: "300",
              textAlign: "center",
              lineHeight: "1"
            }}>
              {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              position: "absolute",
              top: "40px",
              right: "8px",
              background: "rgba(255,255,255,0.95)",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              zIndex: 1000,
              minWidth: "200px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
              <div style={{ fontWeight: "600", marginBottom: "8px", fontSize: "12px" }}>
                Clock Colors
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", minWidth: "60px" }}>Time:</label>
                  <input
                    type="color"
                    value={colors.timeColor}
                    onChange={(e) => setColors(prev => ({ ...prev, timeColor: e.target.value }))}
                    style={{ width: "30px", height: "20px" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", minWidth: "60px" }}>Date:</label>
                  <input
                    type="color"
                    value={colors.dateColor}
                    onChange={(e) => setColors(prev => ({ ...prev, dateColor: e.target.value }))}
                    style={{ width: "30px", height: "20px" }}
                  />
                </div>

                {showWeekday && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "11px", minWidth: "60px" }}>Weekday:</label>
                    <input
                      type="color"
                      value={colors.weekdayColor}
                      onChange={(e) => setColors(prev => ({ ...prev, weekdayColor: e.target.value }))}
                      style={{ width: "30px", height: "20px" }}
                    />
                  </div>
                )}

                {showTimezone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "11px", minWidth: "60px" }}>Timezone:</label>
                    <input
                      type="color"
                      value={colors.timezoneColor}
                      onChange={(e) => setColors(prev => ({ ...prev, timezoneColor: e.target.value }))}
                      style={{ width: "30px", height: "20px" }}
                    />
                  </div>
                )}

                <button
                  style={{
                    ...glassButtonStyle,
                    fontSize: "11px",
                    padding: "4px 8px",
                    marginTop: "4px"
                  }}
                  onClick={() => setColors({
                    timeColor: "#1a365d",
                    dateColor: "#4a5568",
                    weekdayColor: "#718096",
                    timezoneColor: "#a0aec0"
                  })}
                >
                  Reset Colors
                </button>
              </div>
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
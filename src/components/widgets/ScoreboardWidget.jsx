import React, { useState, useEffect } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function ScoreboardWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetData, widgetTransparency, hideTitles }) {
  const { ref, getPosition } = useDraggable(position || { x: 40, y: 40, width: 400, height: 320 });
  const { ref: contentRef, fontSize, spacing, isSmall } = useWidgetDimensions();

  // Default teams
  const defaultTeams = [
    { id: 1, name: "Team 1", score: 0, color: "#3b82f6" },
    { id: 2, name: "Team 2", score: 0, color: "#ef4444" }
  ];

  const [teams, setTeams] = useState(defaultTeams);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Initialize from saved data
  useEffect(() => {
    if (widgetData?.teams) {
      setTeams(widgetData.teams);
    }
  }, [widgetData]);

  // Register position and data
  useEffect(() => {
    if (registerRef) {
      registerRef(() => {
        const pos = getPosition();
        return { ...pos, teams };
      });
    }
  }, [getPosition, registerRef, teams]);

  const addTeam = () => {
    const colors = ["#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];
    const newColor = colors[teams.length % colors.length];

    const newTeam = {
      id: Date.now(),
      name: `Team ${teams.length + 1}`,
      score: 0,
      color: newColor
    };

    setTeams([...teams, newTeam]);
  };

  const removeTeam = (teamId) => {
    if (teams.length > 1) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
  };

  const updateScore = (teamId, change) => {
    setTeams(teams.map(team =>
      team.id === teamId
        ? { ...team, score: Math.max(0, team.score + change) }
        : team
    ));
  };

  const resetScores = () => {
    setTeams(teams.map(team => ({ ...team, score: 0 })));
  };

  const updateTeamName = (teamId, newName) => {
    setTeams(teams.map(team =>
      team.id === teamId ? { ...team, name: newName.trim() || team.name } : team
    ));
    setEditingTeam(null);
    setEditingName("");
  };

  const updateTeamColor = (teamId, newColor) => {
    setTeams(teams.map(team =>
      team.id === teamId ? { ...team, color: newColor } : team
    ));
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "6px",
    padding: `${spacing(6, 4, 8)}px`,
    fontSize: `${fontSize * 0.8}px`,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.9)",
    color: "#374151",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const scoreButtonStyle = {
    ...buttonStyle,
    fontSize: `${fontSize * 0.9}px`,
    minWidth: "40px",
    fontWeight: "700"
  };

  return (
    <div ref={ref}>
      <WidgetWrapper
        title="Scoreboard"
        onRemove={onRemove}
        onRename={onRename}
        glassButtonStyle={glassButtonStyle}
        widgetTransparency={widgetTransparency}
        hideTitles={hideTitles}
        extraButton={
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              ...glassButtonStyle,
              padding: "2px 6px",
              fontSize: "12px",
              flexShrink: 0
            }}
            title="Team Settings"
          >
            ⚙️
          </button>
        }
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: `${spacing(8, 6, 10)}px`,
            padding: `${spacing(8, 6, 10)}px`
          }}
        >
          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              background: "rgba(243, 244, 246, 0.9)",
              borderRadius: "8px",
              padding: `${spacing(8, 6, 10)}px`,
              border: "1px solid #e5e7eb",
              display: "flex",
              gap: `${spacing(8, 6, 10)}px`,
              flexWrap: "wrap",
              alignItems: "center"
            }}>
              <button
                onClick={addTeam}
                style={{
                  ...buttonStyle,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white"
                }}
                title="Add Team"
              >
                + Team
              </button>
              <button
                onClick={resetScores}
                style={{
                  ...buttonStyle,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white"
                }}
                title="Reset All Scores"
              >
                🔄 Reset
              </button>
            </div>
          )}

          {/* Teams Display */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isSmall ? "1fr" : teams.length <= 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))",
            gap: `${spacing(10, 8, 12)}px`,
            flex: 1,
            alignItems: "stretch"
          }}>
            {teams.map((team) => (
              <div
                key={team.id}
                style={{
                  background: `linear-gradient(135deg, ${team.color}20, ${team.color}10)`,
                  border: `2px solid ${team.color}`,
                  borderRadius: "12px",
                  padding: `${spacing(12, 10, 16)}px`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: `${spacing(8, 6, 10)}px`,
                  position: "relative",
                  minHeight: "120px"
                }}
              >
                {/* Remove Team Button */}
                {teams.length > 1 && showSettings && (
                  <button
                    onClick={() => removeTeam(team.id)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      ...buttonStyle,
                      background: "#ef4444",
                      color: "white",
                      fontSize: "10px",
                      minWidth: "20px",
                      padding: "2px"
                    }}
                    title="Remove Team"
                  >
                    ✕
                  </button>
                )}

                {/* Team Name */}
                {editingTeam === team.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => updateTeamName(team.id, editingName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateTeamName(team.id, editingName);
                      if (e.key === "Escape") { setEditingTeam(null); setEditingName(""); }
                    }}
                    autoFocus
                    style={{
                      border: "2px solid #fff",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: `${fontSize}px`,
                      fontWeight: "700",
                      textAlign: "center",
                      background: "white",
                      color: team.color
                    }}
                  />
                ) : (
                  <h3
                    onClick={() => showSettings && (() => {
                      setEditingTeam(team.id);
                      setEditingName(team.name);
                    })()}
                    style={{
                      margin: 0,
                      fontSize: `${fontSize * 1.1}px`,
                      fontWeight: "700",
                      color: team.color,
                      textAlign: "center",
                      cursor: showSettings ? "pointer" : "default",
                      wordBreak: "break-word"
                    }}
                  >
                    {team.name}
                  </h3>
                )}

                {/* Team Color Picker */}
                {showSettings && (
                  <input
                    type="color"
                    value={team.color}
                    onChange={(e) => updateTeamColor(team.id, e.target.value)}
                    style={{
                      width: "30px",
                      height: "20px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                    title="Change Team Color"
                  />
                )}

                {/* Score Display */}
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    color: team.color,
                    textAlign: "center",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    lineHeight: "1"
                  }}
                >
                  {team.score}
                </div>

                {/* Score Control Buttons */}
                <div style={{
                  display: "flex",
                  gap: `${spacing(6, 4, 8)}px`,
                  alignItems: "center"
                }}>
                  <button
                    onClick={() => updateScore(team.id, -1)}
                    style={{
                      ...scoreButtonStyle,
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white"
                    }}
                    title="Remove Point"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateScore(team.id, 1)}
                    style={{
                      ...scoreButtonStyle,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "white"
                    }}
                    title="Add Point"
                  >
                    +1
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {!showSettings && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: `${spacing(8, 6, 10)}px`,
              flexWrap: "wrap"
            }}>
              <button
                onClick={resetScores}
                style={{
                  ...buttonStyle,
                  background: "linear-gradient(135deg, #6b7280, #4b5563)",
                  color: "white",
                  fontSize: `${fontSize * 0.7}px`
                }}
                title="Reset All Scores"
              >
                🔄 Reset All
              </button>
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
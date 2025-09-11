import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function PollWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 200, y: 260 });
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [options, setOptions] = useState(["A", "B", "C"]);
  const [votes, setVotes] = useState({});
  const [newOption, setNewOption] = useState("");
  const [editValues, setEditValues] = useState({}); // temporary values for editing

  // Cast vote
  const vote = opt => setVotes(v => ({ ...v, [opt]: (v[opt] || 0) + 1 }));

  // Add new option
  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions(prev => [...prev, trimmed]);
      setNewOption("");
    }
  };

  // Apply renaming
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

  return (
    <div ref={ref}>
      <WidgetWrapper title="Poll" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div>
          {options.map(o => (
            <div key={o} style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
              <button style={glassButtonStyle} onClick={() => vote(o)}>{o}</button>
              <span>Votes: {votes[o] || 0}</span>
              <input
                type="text"
                value={editValues[o] !== undefined ? editValues[o] : o}
                onChange={e => setEditValues(prev => ({ ...prev, [o]: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") applyRename(o); }}
                style={{ width: "80px" }}
              />
              <button style={glassButtonStyle} onClick={() => deleteOption(o)}>X</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "4px" }}>
          <input
            value={newOption}
            onChange={e => setNewOption(e.target.value)}
            placeholder="New option"
          />
          <button style={glassButtonStyle} onClick={addOption}>Add</button>
        </div>
      </WidgetWrapper>
    </div>
  );
}

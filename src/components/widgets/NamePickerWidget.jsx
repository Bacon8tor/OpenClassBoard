import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function NamePickerWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 400, y: 300 });
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [names, setNames] = useState(["Alice", "Bob", "Charlie"]);
  const [selected, setSelected] = useState("");
  const [uniquePick, setUniquePick] = useState(false);

  const pick = () => {
    if (names.length === 0) return;
    const idx = Math.floor(Math.random() * names.length);
    const picked = names[idx];
    setSelected(picked);
    if (uniquePick) {
      setNames(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const resetNames = () => {
    setNames(["Alice", "Bob", "Charlie"]);
    setSelected("");
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Name Picker" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ marginBottom: 6 }}>
          <input
            value={names.join(",")}
            onChange={e => setNames(e.target.value.split(","))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <button style={glassButtonStyle} onClick={pick}>Pick</button>
          <button style={glassButtonStyle} onClick={resetNames}>Reset</button>
        </div>
        <div style={{ marginBottom: 6 }}>
          <label>
            <input type="checkbox" checked={uniquePick} onChange={e => setUniquePick(e.target.checked)} />
            &nbsp;Don't pick same name twice
          </label>
        </div>
        <div><b>Selected:</b> {selected}</div>
      </WidgetWrapper>
    </div>
  );
}

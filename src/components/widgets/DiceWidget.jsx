import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function DiceWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 400, y: 200 });
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [value, setValue] = useState(1);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ fontSize: "36px", textAlign: "center" }}>{value}</div>
        <button style={glassButtonStyle} onClick={() => setValue(Math.floor(Math.random() * 6) + 1)}>Roll</button>
      </WidgetWrapper>
    </div>
  );
}

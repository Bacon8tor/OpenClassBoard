import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function DiceWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 400, y: 200 });
  useEffect(() => {
    if (registerRef) registerRef(getPosition);
  }, [getPosition, registerRef]);

  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(6);
  const [values, setValues] = useState([1]);

  const rollDice = () => {
    const newValues = Array.from({ length: diceCount }, () =>
      Math.floor(Math.random() * diceSides) + 1
    );
    setValues(newValues);
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Dice" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <label>
            Dice Count:{" "}
            <input
              type="number"
              min="1"
              value={diceCount}
              style={{ width: "60px" }}
              onChange={(e) => {
                const count = Math.max(1, parseInt(e.target.value) || 1);
                setDiceCount(count);
                setValues(Array(count).fill(1)); // reset displayed dice
              }}
            />
          </label>
          <br />
          <label>
            Dice Sides:{" "}
            <input
              type="number"
              min="2"
              value={diceSides}
              style={{ width: "60px" }}
              onChange={(e) => {
                const sides = Math.max(2, parseInt(e.target.value) || 6);
                setDiceSides(sides);
              }}
            />
          </label>
        </div>
        <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "8px" }}>
          {values.join(" ")}
        </div>
        <button style={glassButtonStyle} onClick={rollDice}>Roll</button>
      </WidgetWrapper>
    </div>
  );
}

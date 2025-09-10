import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import WidgetWrapper from "../WidgetWrapper";

export default function ConversionWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 500, y: 250 });
  useEffect(() => { if (registerRef) registerRef(getPosition); }, [getPosition, registerRef]);

  const [value, setValue] = useState(0);
  const [ingredient, setIngredient] = useState("flour");
  const [inputUnit, setInputUnit] = useState("grams");
  const [outputUnit, setOutputUnit] = useState("cups");
  const [result, setResult] = useState(0);

  // Ingredient densities in grams per cup
  const densities = {
    flour: 120,
    sugar: 200,
    cocoa: 125,
    butter: 227,
    milk: 240,
    water: 240,
    honey: 340,
    oil: 218,
  };

  // Supported units
  const units = [
    "mg", "grams", "kg", "ounces", "pounds",
    "teaspoons", "tablespoons", "cups",
    "milliliters", "liters"
  ];

  // Volume units to cups
  const volumeToCups = {
    teaspoons: 1 / 48,
    tablespoons: 1 / 16,
    cups: 1,
    milliliters: 1 / 240,
    liters: 1000 / 240, // 1L = 1000ml
  };

  // Mass units to grams
  const massToGrams = {
    mg: 0.001,
    grams: 1,
    kg: 1000,
    ounces: 28.3495,
    pounds: 453.592,
  };

  // Convert input value to grams
  const toGrams = (value, unit, density) => {
    if (massToGrams[unit]) {
      return value * massToGrams[unit];
    } else {
      // volume unit
      const cups = value * (volumeToCups[unit] || 1);
      return cups * density;
    }
  };

  // Convert grams to output unit
  const fromGrams = (grams, unit, density) => {
    if (massToGrams[unit]) {
      return grams / massToGrams[unit];
    } else {
      const cups = grams / density;
      switch (unit) {
        case "cups": return cups;
        case "tablespoons": return cups * 16;
        case "teaspoons": return cups * 48;
        case "milliliters": return cups * 240;
        case "liters": return cups * 0.24; // 1 cup ≈ 240 mL
        default: return cups;
      }
    }
  };

  useEffect(() => {
    const density = densities[ingredient] || 100;
    const grams = toGrams(value, inputUnit, density);
    const converted = fromGrams(grams, outputUnit, density);
    setResult(converted);
  }, [value, inputUnit, outputUnit, ingredient]);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Conversion" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
        <div style={{ marginBottom: 4 }}>
          <input
            type="number"
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            style={{ width: "60px", marginRight: 4 }}
          />
          <select value={inputUnit} onChange={e => setInputUnit(e.target.value)} style={{ marginRight: 4 }}>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          to
          <select value={outputUnit} onChange={e => setOutputUnit(e.target.value)} style={{ marginLeft: 4 }}>
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 4 }}>
          <select value={ingredient} onChange={e => setIngredient(e.target.value)}>
            {Object.keys(densities).map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>Result: {Number(result.toFixed(2))} {outputUnit}</div>
      </WidgetWrapper>
    </div>
  );
}

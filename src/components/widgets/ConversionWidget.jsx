import React, { useEffect, useState } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function ConversionWidget({ onRemove, onRename, position, registerRef, glassButtonStyle }) {
  const { ref, getPosition } = useDraggable(position || { x: 500, y: 250, width: 300, height: 220 });
  const { ref: contentRef, fontSize, spacing, isSmall, isMedium } = useWidgetDimensions();
  
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
    rice: 195,
    salt: 292,
    vanilla: 208
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
    liters: 1000 / 240,
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
        case "liters": return cups * 0.24;
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

  // Calculate responsive sizes
  const labelSize = fontSize(12, 9, 15);
  const inputSize = fontSize(11, 8, 14);
  const resultSize = fontSize(16, 12, 24);
  const pad = spacing(8, 4, 12);
  const gap = spacing(6, 3, 10);

  const inputStyle = {
    fontSize: `${inputSize}px`,
    padding: `${spacing(3, 2, 6)}px`,
    border: "1px solid #ccc",
    borderRadius: "3px",
    marginBottom: `${spacing(4, 2, 8)}px`,
    color: "black"
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: "white"
  };

  return (
    <div ref={ref}>
      <WidgetWrapper title="Conversion" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle}>
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
          
          {/* Input section */}
          <div style={{ 
            display: "flex", 
            flexDirection: isSmall ? "column" : "row",
            alignItems: isSmall ? "stretch" : "center",
            gap: `${spacing(4, 2, 8)}px`,
            flexShrink: 0,
            color: "white"
          }}>
            <input
              type="number"
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              placeholder="Amount"
              style={{ 
                ...inputStyle,
                width: isSmall ? "100%" : "80px",
                marginBottom: 0,
                color: "white"
              }}
            />
            
            <select 
              value={inputUnit} 
              onChange={e => setInputUnit(e.target.value)} 
              style={{ 
                ...selectStyle,
                width: isSmall ? "100%" : "auto",
                marginBottom: 0
              }}
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            
            {!isSmall && (
              <span style={{ 
                fontSize: `${inputSize}px`, 
                fontWeight: "bold",
                color: "#666"
              }}>
                to
              </span>
            )}
            
            <select 
              value={outputUnit} 
              onChange={e => setOutputUnit(e.target.value)} 
              style={{ 
                ...selectStyle,
                width: isSmall ? "100%" : "auto",
                marginBottom: 0
              }}
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Ingredient selector */}
          <div style={{ 
            display: "flex", 
            flexDirection: isSmall ? "column" : "row",
            alignItems: isSmall ? "stretch" : "center",
            gap: `${spacing(4, 2, 8)}px`,
            flexShrink: 0
          }}>
            <label style={{ 
              fontSize: `${inputSize}px`,
              fontWeight: "bold",
              minWidth: isSmall ? "auto" : "70px"
            }}>
              Ingredient:
            </label>
            <select 
              value={ingredient} 
              onChange={e => setIngredient(e.target.value)}
              style={{ 
                ...selectStyle,
                flex: 1,
                marginBottom: 0
              }}
            >
              {Object.keys(densities).map(i => (
                <option key={i} value={i}>
                  {i.charAt(0).toUpperCase() + i.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Result display */}
          <div style={{ 
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: "8px",
            border: "2px solid rgba(76,175,80,0.3)",
            padding: `${spacing(8, 4, 16)}px`,
            textAlign: "center"
          }}>
            <div>
              <div style={{ 
                fontSize: `${resultSize * 5}px`,
                fontWeight: "bold",
                color: "#2e7d32",
                fontFamily: "monospace",
                lineHeight: "1.2"
              }}>
                {Number(result.toFixed(3))}
              </div>
              <div style={{ 
                fontSize: `${fontSize(12, 9, 16)}px`,
                color: "#666",
                marginTop: `${spacing(2, 1, 4)}px`
              }}>
                {outputUnit}
              </div>
            </div>
          </div>

          {/* Conversion info */}
          {!isSmall && (
            <div style={{
              fontSize: `${fontSize(10, 8, 12)}px`,
              color: "#888",
              textAlign: "center",
              flexShrink: 0,
              paddingTop: `${spacing(4, 2, 6)}px`,
              borderTop: "1px solid rgba(0,0,0,0.1)"
            }}>
              Density: {densities[ingredient]}g/cup
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
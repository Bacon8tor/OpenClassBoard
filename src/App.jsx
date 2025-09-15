import React, { useEffect, useRef, useState } from "react";

// Widgets
import Stoplight from "./components/widgets/Stoplight";
import ClockWidget from "./components/widgets/ClockWidget";
import TimerWidget from "./components/widgets/TimerWidget";
import PollWidget from "./components/widgets/PollWidget";
import DiceWidget from "./components/widgets/DiceWidget";
import NamePickerWidget from "./components/widgets/NamePickerWidget";
import ConversionWidget from "./components/widgets/ConversionWidget";

import BottomBar from "./components/BottomBar";

export default function OpenClassScreen() {
  const [bgUrl, setBgUrl] = useState("");
  const [bgColor, setBgColor] = useState("#800cb6ff");
  const [widgets, setWidgets] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [barMinimized, setBarMinimized] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [theme, setTheme] = useState("glass"); // widget theme
  const [customStyle, setCustomStyle] = useState({
    bgColor: "#ffffff",
    fontColor: "#000000"
  });

  const widgetRefs = useRef({});

  const glassButtonStyle = {
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "8px",
    padding: "6px 12px",
    color: "#000",
    fontWeight: "500",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  // Load saved layout
  useEffect(() => {
    const saved = localStorage.getItem("openClassBoard");
    if (saved) {
      const data = JSON.parse(saved);
      setWidgets(data.widgets || []);
      setBgUrl(data.bgUrl || "");
      setBgColor(data.bgColor || "#800cb6ff");
    }
  }, []);

  const addWidget = type => {
    // Default sizes for different widget types
    const defaultSizes = {
      stoplight: { width: 120, height: 280 },
      clock: { width: 200, height: 120 },
      timer: { width: 180, height: 160 },
      poll: { width: 250, height: 300 },
      dice: { width: 200, height: 180 },
      namepicker: { width: 220, height: 200 },
      conversion: { width: 280, height: 180 }
    };

    const size = defaultSizes[type] || { width: 200, height: 150 };
    
    setWidgets(prev => [
      ...prev,
      { 
        id: Date.now(), 
        type, 
        title: type.charAt(0).toUpperCase() + type.slice(1),
        position: { x: 40, y: 40, ...size }
      }
    ]);
  };

  const removeWidget = id =>
    setWidgets(prev => prev.filter(w => w.id !== id));
  
  const renameWidget = (id, newTitle) =>
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, title: newTitle } : w))
    );

  // Saving/loading with position and size
  const saveNamedScreen = name => {
    if (!name) return alert("Provide a name!");
    const widgetsWithPos = widgets.map(w => {
      const getPos = widgetRefs.current[w.id];
      const pos = getPos ? getPos() : w.position || { x: 40, y: 40, width: 200, height: 150 };
      return { ...w, position: pos };
    });
    const data = { widgets: widgetsWithPos, bgUrl, bgColor };
    const savedScreens = JSON.parse(localStorage.getItem("namedScreens") || "{}");
    savedScreens[name] = data;
    localStorage.setItem("namedScreens", JSON.stringify(savedScreens));
    
    // Also save as current layout
    localStorage.setItem("openClassBoard", JSON.stringify(data));
    
    alert(`Screen saved as "${name}"`);
  };

  const loadNamedScreen = name => {
    const savedScreens = JSON.parse(localStorage.getItem("namedScreens") || "{}");
    const data = savedScreens[name];
    if (!data) return alert(`No saved screen found: ${name}`);
    setWidgets(data.widgets || []);
    setBgUrl(data.bgUrl || "");
    setBgColor(data.bgColor || "#800cb6ff");
    
    // Also save as current layout
    localStorage.setItem("openClassBoard", JSON.stringify(data));
  };

  const deleteNamedScreen = name => {
    const savedScreens = JSON.parse(localStorage.getItem("namedScreens") || "{}");
    delete savedScreens[name];
    localStorage.setItem("namedScreens", JSON.stringify(savedScreens));
    setSaveName("");
  };

  const getSavedScreenNames = () =>
    Object.keys(JSON.parse(localStorage.getItem("namedScreens") || "{}"));

  const handleFile = file => {
    if (!file) return;
    setBgUrl(URL.createObjectURL(file));
  };

  // Auto-save current layout when widgets change
  useEffect(() => {
    const saveCurrentLayout = () => {
      const widgetsWithPos = widgets.map(w => {
        const getPos = widgetRefs.current[w.id];
        const pos = getPos ? getPos() : w.position || { x: 40, y: 40, width: 200, height: 150 };
        return { ...w, position: pos };
      });
      const data = { widgets: widgetsWithPos, bgUrl, bgColor };
      localStorage.setItem("openClassBoard", JSON.stringify(data));
    };

    const timeoutId = setTimeout(saveCurrentLayout, 1000); // Auto-save after 1 second of no changes
    return () => clearTimeout(timeoutId);
  }, [widgets, bgUrl, bgColor]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          backgroundColor: bgColor,
          backgroundImage: bgUrl ? `url(${bgUrl})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* Settings */}
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <button
          style={{ ...glassButtonStyle, borderRadius: "50%", width: 40, height: 40, zIndex: 9999 }}
          onClick={() => setSettingsOpen(o => !o)}
        >
          ⚙
        </button>
        {settingsOpen && (
          <div
            style={{
              position: "absolute",
              top: 44,
              right: 0,
              background: "rgba(255,255,255,0.95)",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 12,
              width: 260,
              color: "black",
              zIndex: 9999 
            }}
          >
            {/* Background */}
            <label>Background Color:</label>
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              style={{ width: "100%", marginBottom: 6 }}
            />
            <label>Or Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleFile(e.target.files[0])}
              style={{ width: "100%", marginBottom: 6 }}
            />
            {bgUrl && (
              <button
                style={{ ...glassButtonStyle, width: "100%", marginBottom: 6 }}
                onClick={() => setBgUrl("")}
              >
                Clear Background Image
              </button>
            )}

            {/* Save/Load */}
            <input
              type="text"
              placeholder="Save name..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              style={{ width: "100%", marginBottom: 6 }}
            />
            <button style={glassButtonStyle} onClick={() => saveNamedScreen(saveName)}>
              Save Screen
            </button>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Load/Delete Saved Screens:</div>
              {getSavedScreenNames().map(name => (
                <div key={name} style={{ display: "flex", gap: "4px", marginBottom: 4 }}>
                  <button
                    style={{ ...glassButtonStyle, flex: 1 }}
                    onClick={() => loadNamedScreen(name)}
                  >
                    {name}
                  </button>
                  <button style={glassButtonStyle} onClick={() => deleteNamedScreen(name)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              style={{ ...glassButtonStyle, marginTop: 12, width: "100%" }}
              onClick={() => {
                setWidgets([]);
                setBgUrl("");
                setBgColor("#800cb6ff");
                localStorage.removeItem("openClassBoard");
              }}
            >
              Reset Layout
            </button>
            <br />
            <br />
            <div style={{ justifyContent: "center" }}>
              <a href="https://www.buymeacoffee.com/bacon8tor">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=bacon8tor&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" />
              </a>
            </div>
            <div style={{ fontSize: 12, color: "#555", textAlign: "center" }}>
              <p>OpenClassBoard was made and is maintained by a solo developer. If you find it useful, please consider supporting my work.
              The Code is Opensource on <a href="https://github.com/Bacon8tor/OpenClassBoard">Github</a></p>
            </div>
          </div>
        )}
      </div>

      {/* Widgets */}
      {widgets.map(w => {
        const commonProps = {
          key: w.id,
          onRemove: () => removeWidget(w.id),
          onRename: t => renameWidget(w.id, t),
          position: w.position,
          registerRef: getPos => (widgetRefs.current[w.id] = getPos),
          glassButtonStyle,
          theme,
          customStyle
        };

        switch (w.type) {
          case "stoplight":
            return <Stoplight {...commonProps} />;
          case "clock":
            return <ClockWidget {...commonProps} />;
          case "timer":
            return <TimerWidget {...commonProps} />;
          case "poll":
            return <PollWidget {...commonProps} />;
          case "dice":
            return <DiceWidget {...commonProps} />;
          case "namepicker":
            return <NamePickerWidget {...commonProps} />;
          case "conversion":
            return <ConversionWidget {...commonProps} />;
          default:
            return null;
        }
      })}

      {/* Bottom Bar */}
      <BottomBar
        barMinimized={barMinimized}
        setBarMinimized={setBarMinimized}
        glassButtonStyle={glassButtonStyle}
        addWidget={addWidget}
      />
    </div>
  );
}
import React, { useState, useRef, useEffect } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function TextWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetData, widgetTransparency, hideTitles }) {
  const { ref, getPosition } = useDraggable(position || { x: 40, y: 40, width: 350, height: 300 });
  const { ref: contentRef, fontSize, spacing, isSmall } = useWidgetDimensions();
  const editorRef = useRef(null);

  useEffect(() => {
    if (registerRef) registerRef(() => {
      const pos = getPosition();
      return { ...pos, content: editorRef.current?.innerHTML || "" };
    });
  }, [getPosition, registerRef]);

  // Initialize content from saved data
  useEffect(() => {
    if (widgetData?.content && editorRef.current) {
      editorRef.current.innerHTML = widgetData.content;
    }
  }, [widgetData]);

  const [showToolbar, setShowToolbar] = useState(false);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const toggleList = (listType) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      executeCommand(listType === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { icon: "B", command: "bold", title: "Bold" },
    { icon: "I", command: "italic", title: "Italic" },
    { icon: "U", command: "underline", title: "Underline" },
    { icon: "•", action: () => toggleList('unordered'), title: "Bullet List" },
    { icon: "1.", action: () => toggleList('ordered'), title: "Numbered List" },
    { icon: "🔗", action: insertLink, title: "Insert Link" },
    { icon: "H1", command: "formatBlock", value: "h1", title: "Heading 1" },
    { icon: "H2", command: "formatBlock", value: "h2", title: "Heading 2" },
    { icon: "P", command: "formatBlock", value: "p", title: "Paragraph" },
  ];

  const buttonStyle = {
    border: "none",
    borderRadius: "4px",
    padding: `${spacing(4, 3, 6)}px`,
    margin: "2px",
    fontSize: `${fontSize * 0.8}px`,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.8)",
    color: "#374151",
    minWidth: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const editorStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: `${spacing(12, 8, 16)}px`,
    minHeight: "150px",
    background: "white",
    fontSize: `${fontSize}px`,
    lineHeight: "1.5",
    outline: "none",
    overflow: "auto",
    fontFamily: "system-ui, -apple-system, sans-serif"
  };

  return (
    <div ref={ref}>
      <WidgetWrapper
        title="Text Editor"
        onRemove={onRemove}
        onRename={onRename}
        glassButtonStyle={glassButtonStyle}
        widgetTransparency={widgetTransparency}
        hideTitles={hideTitles}
        extraButton={
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            style={{
              ...glassButtonStyle,
              padding: "2px 6px",
              fontSize: "12px",
              flexShrink: 0
            }}
            title="Toggle Toolbar"
          >
            🛠️
          </button>
        }
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: `${spacing(8, 6, 10)}px`
          }}
        >
          {/* Toolbar */}
          {showToolbar && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2px",
              padding: `${spacing(6, 4, 8)}px`,
              background: "rgba(243, 244, 246, 0.8)",
              borderRadius: "6px",
              border: "1px solid #e5e7eb"
            }}>
              {toolbarButtons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => btn.action ? btn.action() : executeCommand(btn.command, btn.value)}
                  style={buttonStyle}
                  title={btn.title}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(59, 130, 246, 0.1)";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.8)";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          )}

          {/* Rich Text Editor */}
          <div
            ref={editorRef}
            contentEditable
            style={editorStyle}
            placeholder="Start typing your text here... Use the toolbar for formatting options!"
            suppressContentEditableWarning={true}
            onFocus={() => setShowToolbar(true)}
            onInput={(e) => {
              // Auto-save content changes
              const content = e.target.innerHTML;
              if (registerRef) {
                registerRef(() => {
                  const pos = getPosition();
                  return { ...pos, content };
                });
              }
            }}
          />

          {/* Help Text */}
          {!showToolbar && (
            <div style={{
              fontSize: `${fontSize * 0.7}px`,
              color: "#6b7280",
              textAlign: "center",
              padding: `${spacing(4, 3, 6)}px`,
              background: "rgba(249, 250, 251, 0.8)",
              borderRadius: "4px",
              border: "1px solid #f3f4f6"
            }}>
              Click the 🛠️ button to show formatting toolbar
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
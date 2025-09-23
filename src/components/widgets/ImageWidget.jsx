import React, { useState, useEffect } from "react";
import useDraggable from "../../hooks/useDraggable";
import useWidgetDimensions from "../../hooks/useWidgetDimensions";
import WidgetWrapper from "../WidgetWrapper";

export default function ImageWidget({ onRemove, onRename, position, registerRef, glassButtonStyle, widgetTransparency, hideTitles }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const { ref, getPosition } = useDraggable(position || { x: 40, y: 40, width: 300, height: 250 });
  const { ref: contentRef, dimensions } = useWidgetDimensions();

  useEffect(() => {
    if (registerRef) registerRef(getPosition);
  }, [getPosition, registerRef]);

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageFile(file);
      setShowUrlInput(false);
    }
  };

  const handleUrlSubmit = (url) => {
    if (url.trim()) {
      setImageUrl(url.trim());
      setImageFile(null);
      setShowUrlInput(false);
    }
  };

  const clearImage = () => {
    if (imageFile) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl("");
    setImageFile(null);
  };

  useEffect(() => {
    return () => {
      if (imageFile && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageFile, imageUrl]);

  return (
    <div ref={ref}>
      <WidgetWrapper title="Image" onRemove={onRemove} onRename={onRename} glassButtonStyle={glassButtonStyle} widgetTransparency={widgetTransparency} hideTitles={hideTitles}>
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "8px",
            gap: "8px"
          }}
        >
          {!imageUrl ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "12px",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Add an image to display
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                style={{ display: "none" }}
                id={`file-upload-${getPosition().x}-${getPosition().y}`}
              />
              <label
                htmlFor={`file-upload-${getPosition().x}-${getPosition().y}`}
                style={{
                  ...glassButtonStyle,
                  cursor: "pointer",
                  display: "inline-block"
                }}
              >
                Upload Image
              </label>

              <div style={{ fontSize: "12px", color: "#888" }}>or</div>

              {!showUrlInput ? (
                <button
                  style={glassButtonStyle}
                  onClick={() => setShowUrlInput(true)}
                >
                  Add Image URL
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  <input
                    type="url"
                    placeholder="Enter image URL..."
                    style={{
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlSubmit(e.target.value);
                      }
                    }}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      style={{ ...glassButtonStyle, fontSize: "11px", padding: "4px 8px" }}
                      onClick={(e) => {
                        const input = e.target.parentElement.previousElementSibling;
                        handleUrlSubmit(input.value);
                      }}
                    >
                      Add
                    </button>
                    <button
                      style={{ ...glassButtonStyle, fontSize: "11px", padding: "4px 8px" }}
                      onClick={() => setShowUrlInput(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: "8px"
            }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "6px",
                backgroundColor: "#f5f5f5"
              }}>
                <img
                  src={imageUrl}
                  alt="Widget content"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "4px"
                  }}
                  onError={() => {
                    console.error("Failed to load image:", imageUrl);
                    clearImage();
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                <button
                  style={{ ...glassButtonStyle, fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => setShowUrlInput(true)}
                >
                  Change URL
                </button>
                <button
                  style={{ ...glassButtonStyle, fontSize: "11px", padding: "4px 8px" }}
                  onClick={clearImage}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </WidgetWrapper>
    </div>
  );
}
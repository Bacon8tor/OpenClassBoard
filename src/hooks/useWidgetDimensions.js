import { useState, useEffect, useRef } from "react";

export default function useWidgetDimensions() {
  const [dimensions, setDimensions] = useState({ width: 200, height: 150 });
  const ref = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Helper function to scale values based on widget size
  const scale = (baseValue, minSize = 150, maxSize = 400) => {
    const avgDimension = (dimensions.width + dimensions.height) / 2;
    const ratio = Math.max(0.5, Math.min(2, (avgDimension - minSize) / (maxSize - minSize)));
    return Math.max(baseValue * 0.5, baseValue * (0.5 + ratio * 0.5));
  };

  // Font size scaling
  const fontSize = (base, min = 8, max = 32) => {
    const scaled = scale(base);
    return Math.max(min, Math.min(max, scaled));
  };

  // Padding/margin scaling
  const spacing = (base, min = 2, max = 20) => {
    const scaled = scale(base);
    return Math.max(min, Math.min(max, scaled));
  };

  return { 
    ref, 
    dimensions, 
    scale, 
    fontSize, 
    spacing,
    // Quick access to common scaled values
    isSmall: dimensions.width < 180 || dimensions.height < 120,
    isMedium: dimensions.width >= 180 && dimensions.width < 300,
    isLarge: dimensions.width >= 300
  };
}
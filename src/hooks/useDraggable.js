import { useEffect, useRef, useState } from "react";

export default function useDraggable(initial = { x: 40, y: 40, width: 200, height: 150 }) {
  const ref = useRef(null);
  const posRef = useRef({ 
    x: initial.x, 
    y: initial.y, 
    width: initial.width || 200, 
    height: initial.height || 150 
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    let dragging = false;
    let resizing = false;
    let start = { x: 0, y: 0 };
    let startSize = { width: 0, height: 0 };

    // Create single resize handle in bottom-right corner
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0px';
    resizeHandle.style.right = '0px';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.zIndex = '1000';
    resizeHandle.style.background = 'transparent';
    
    // Add visible triangle in corner
    resizeHandle.innerHTML = `
      <svg width="15" height="15" style="position: absolute; bottom: 0; right: 0;">
        <path d="M15,0 L15,15 L0,15 Z" fill="rgba(0,0,0,0.3)" />
        <path d="M15,5 L5,15" stroke="rgba(255,255,255,0.7)" stroke-width="1" />
        <path d="M15,10 L10,15" stroke="rgba(255,255,255,0.7)" stroke-width="1" />
      </svg>
    `;
    
    el.appendChild(resizeHandle);

    function onDown(e) {
      const target = e.target.closest('.resize-handle');
      
      if (target) {
        resizing = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        start = { x: clientX, y: clientY };
        startSize = { width: posRef.current.width, height: posRef.current.height };
        
        e.preventDefault();
        e.stopPropagation();
      } else {
        dragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        start = { x: clientX, y: clientY };
      }
      
      document.body.style.userSelect = "none";
    }

    function onMove(e) {
      if (!dragging && !resizing) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (dragging) {
        const dx = clientX - start.x;
        const dy = clientY - start.y;
        start = { x: clientX, y: clientY };
        posRef.current.x += dx;
        posRef.current.y += dy;
        
        // Keep widget within viewport bounds
        // Account for bottom bar height (approximately 40px when expanded)
        const bottomBarHeight = 40;
        posRef.current.x = Math.max(0, Math.min(window.innerWidth - posRef.current.width, posRef.current.x));
        posRef.current.y = Math.max(0, Math.min(window.innerHeight - posRef.current.height - bottomBarHeight, posRef.current.y));
        
        el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      } else if (resizing) {
        const dx = clientX - start.x;
        const dy = clientY - start.y;
        
        const newWidth = Math.max(150, startSize.width + dx);
        const newHeight = Math.max(100, startSize.height + dy);
        
        // Keep within viewport bounds
        // Account for bottom bar height (approximately 40px when expanded)
        const bottomBarHeight = 40;
        const maxWidth = window.innerWidth - posRef.current.x;
        const maxHeight = window.innerHeight - posRef.current.y - bottomBarHeight;
        
        posRef.current.width = Math.min(newWidth, maxWidth);
        posRef.current.height = Math.min(newHeight, maxHeight);
        
        el.style.width = `${posRef.current.width}px`;
        el.style.height = `${posRef.current.height}px`;
      }
      
      setTick(t => t + 1);
    }

    function onUp() {
      dragging = false;
      resizing = false;
      document.body.style.userSelect = "";
    }

    // Event listeners
    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    // Set initial styles
    el.style.position = "absolute";
    el.style.width = `${posRef.current.width}px`;
    el.style.height = `${posRef.current.height}px`;
    el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    el.style.minWidth = "150px";
    el.style.minHeight = "100px";

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      
      // Clean up resize handle
      if (resizeHandle.parentNode) {
        resizeHandle.parentNode.removeChild(resizeHandle);
      }
    };
  }, []);

  return { 
    ref, 
    getPosition: () => ({ 
      x: posRef.current.x, 
      y: posRef.current.y, 
      width: posRef.current.width, 
      height: posRef.current.height 
    }) 
  };
}
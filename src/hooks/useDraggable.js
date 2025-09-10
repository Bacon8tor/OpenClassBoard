import { useEffect, useRef, useState } from "react";

export default function useDraggable(initial = { x: 40, y: 40 }) {
  const ref = useRef(null);
  const posRef = useRef({ x: initial.x, y: initial.y });
  const [, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging = false;
    let start = { x: 0, y: 0 };

    function onDown(e) {
      dragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      start = { x: clientX, y: clientY };
      document.body.style.userSelect = "none";
    }

    function onMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - start.x;
      const dy = clientY - start.y;
      start = { x: clientX, y: clientY };
      posRef.current.x += dx;
      posRef.current.y += dy;
      el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      setTick(t => t + 1);
    }

    function onUp() {
      dragging = false;
      document.body.style.userSelect = "";
    }

    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    el.style.position = "absolute";
    el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return { ref, getPosition: () => posRef.current };
}

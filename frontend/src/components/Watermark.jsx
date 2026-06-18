import { useEffect, useRef, useCallback } from "react";

export default function Watermark() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const prevMouseRef = useRef({ x: -9999, y: -9999 });
  const trailsRef = useRef([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Apply scaling to the coordinate system
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear using CSS pixel space dimensions
    ctx.clearRect(0, 0, w, h);

    const text = "MOCKPILOT";
    const cx = w / 2;
    const cy = h / 2;

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Dynamically calculate font size so "MOCKPILOT" stays within ~78% of viewport width
    let baseFontSize = 100;
    ctx.font = `800 ${baseFontSize}px 'Space Grotesk', sans-serif`;
    const measuredWidth = ctx.measureText(text).width;
    const targetWidth = w * 0.78;
    let fontSize = Math.floor((targetWidth / measuredWidth) * baseFontSize);
    
    // Clamp to ensure readability on small and large screens
    fontSize = Math.max(36, Math.min(fontSize, w * 0.11));

    ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Track mouse movement for persistence trails
    if (mx > 0 && my > 0) {
      const pmx = prevMouseRef.current.x;
      const pmy = prevMouseRef.current.y;
      if (Math.abs(mx - pmx) > 2 || Math.abs(my - pmy) > 2) {
        trailsRef.current.push({ x: mx, y: my, age: 0 });
        prevMouseRef.current = { x: mx, y: my };
      }
    }

    // Process active trails
    trailsRef.current = trailsRef.current
      .map((t) => ({ ...t, age: t.age + 1 }))
      .filter((t) => t.age < 90);

    // ─── Base text (faint background presence) ───
    ctx.fillStyle = "rgba(245, 242, 234, 0.02)";
    ctx.fillText(text, cx, cy);

    // ─── Water trails (persistent ripple reveal) ───
    for (const trail of trailsRef.current) {
      const life = 1 - trail.age / 90;
      const radius = 140 + trail.age * 1.8;
      const alpha = 0.09 * life;

      if (alpha < 0.002) continue;

      const grad = ctx.createRadialGradient(
        trail.x, trail.y, 0,
        trail.x, trail.y, radius
      );
      grad.addColorStop(0, `rgba(245, 242, 234, ${alpha})`);
      grad.addColorStop(0.5, `rgba(245, 242, 234, ${alpha * 0.4})`);
      grad.addColorStop(1, "rgba(245, 242, 234, 0)");

      const displaceX = (trail.x - cx) * 0.005 * life;
      const displaceY = (trail.y - cy) * 0.005 * life;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.fillText(text, cx + displaceX, cy + displaceY);
      ctx.restore();
    }

    // ─── Cursor glow (active position hover reveal) ───
    if (mx > 0 && my > 0) {
      const cursorRadius = 220;
      const cursorGrad = ctx.createRadialGradient(
        mx, my, 0,
        mx, my, cursorRadius
      );
      cursorGrad.addColorStop(0, "rgba(245, 242, 234, 0.16)");
      cursorGrad.addColorStop(0.4, "rgba(245, 242, 234, 0.06)");
      cursorGrad.addColorStop(1, "rgba(245, 242, 234, 0)");

      const dxC = (mx - cx) * 0.008;
      const dyC = (my - cy) * 0.008;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = cursorGrad;
      ctx.fillText(text, cx + dxC, cy + dyC);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, mixBlendMode: "screen" }}
    />
  );
}

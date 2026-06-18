import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [hoverState, setHoverState] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Motion values for coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Configure smooth spring physics
  const springConfig = { stiffness: 150, damping: 22, mass: 0.6 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches || 
                     ("ontouchstart" in window) || 
                     (navigator.maxTouchPoints > 0);
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (!target) return;

      const isCta = target.closest('[data-cursor="cta"]');
      const isCard = target.closest('[data-cursor="card"]');
      const isButton = target.closest('button') || 
                       target.closest('a') || 
                       target.closest('[role="button"]') ||
                       target.closest('input[type="submit"]');
      const isInputText = target.closest('input:not([type="submit"]):not([type="button"])') ||
                          target.closest('textarea');

      if (isInputText) {
        setHoverState("input");
      } else if (isCta) {
        setHoverState("cta");
      } else if (isCard) {
        setHoverState("card");
      } else if (isButton) {
        setHoverState("button");
      } else {
        setHoverState("default");
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible, isMobile]);

  if (isMobile || !isVisible) return null;

  const ringVariants = {
    default: {
      width: 32,
      height: 32,
      backgroundColor: "rgba(245, 242, 234, 0.0)",
      border: "1px solid rgba(245, 242, 234, 0.25)",
      opacity: 1,
    },
    button: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(245, 242, 234, 0.05)",
      border: "1px solid rgba(245, 242, 234, 0.45)",
      opacity: 1,
    },
    card: {
      width: 72,
      height: 72,
      backgroundColor: "rgba(245, 242, 234, 0.04)",
      border: "1px solid rgba(245, 242, 234, 0.35)",
      opacity: 1,
    },
    cta: {
      width: 80,
      height: 80,
      backgroundColor: "rgba(245, 242, 234, 0.03)",
      border: "1px solid rgba(245, 242, 234, 0.55)",
      opacity: 1,
    },
    input: {
      width: 0,
      height: 0,
      backgroundColor: "rgba(245, 242, 234, 0)",
      border: "0px solid rgba(245, 242, 234, 0)",
      opacity: 0,
    },
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]">
      <motion.div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden"
        style={{
          x: trailX,
          y: trailY,
        }}
        variants={ringVariants}
        animate={hoverState}
        transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.5 }}
      >
        <AnimatePresence>
          {hoverState === "card" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[9px] font-main font-bold tracking-widest text-[#F5F2EA]"
            >
              OPEN
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#F5F2EA] -translate-x-1/2 -translate-y-1/2"
        style={{
          x: mouseX,
          y: mouseY,
          boxShadow: hoverState === "cta" ? "0 0 8px rgba(245, 242, 234, 0.3)" : "none"
        }}
        animate={{
          scale: hoverState === "cta" ? 1.5 : hoverState === "card" ? 0.5 : 1,
          opacity: hoverState === "input" ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </div>
  );
}

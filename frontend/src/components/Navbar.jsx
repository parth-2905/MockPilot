import { useState, useEffect } from "react";

export default function Navbar({ onStartInterview }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <header
      className="fixed top-0 left-0 w-full z-40 px-8 md:px-14 py-8 flex items-center justify-between"
      style={{
        opacity: 0,
        animation: "navFade 1.5s ease forwards 0.2s",
      }}
    >
      <style>{`
        @keyframes navFade {
          to { opacity: 1; }
        }
      `}</style>

      {/* Wordmark */}
      <a
        href="#"
        className="text-[13px] font-main font-medium tracking-[0.15em] text-text uppercase hover:text-accent transition-colors duration-500"
      >
        MockPilot
      </a>

      {/* Links */}
      <nav className="hidden md:flex items-center gap-14">
        {["How it Works", "Features", "For Who"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-[13px] font-main font-light tracking-[0.12em] text-text-dim hover:text-text transition-colors duration-500"
          >
            {link}
          </a>
        ))}
        <a
          href="#start"
          onClick={(e) => {
            e.preventDefault();
            onStartInterview();
          }}
          className="text-[13px] font-main font-light tracking-[0.12em] text-text-dim hover:text-accent transition-colors duration-500"
        >
          Start Interviewing →
        </a>
      </nav>
    </header>
  );
}

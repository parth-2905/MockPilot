export default function Footer() {
  return (
    <footer className="w-full px-8 md:px-14 py-10 border-t border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <span className="text-[10px] font-main font-light tracking-[0.2em] text-text-muted uppercase">
          © 2026 MockPilot
        </span>

        <div className="flex items-center gap-10">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-main font-light tracking-[0.12em] text-text-muted hover:text-text transition-colors duration-500"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-[10px] font-main font-light tracking-[0.12em] text-text-muted hover:text-text transition-colors duration-500"
          >
            Docs
          </a>
          <a
            href="mailto:support@mockpilot.ai"
            className="text-[10px] font-main font-light tracking-[0.12em] text-text-muted hover:text-text transition-colors duration-500"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

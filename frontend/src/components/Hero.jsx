import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero({ onStartInterview }) {
  return (
    <section className="relative min-h-screen w-full flex items-end pb-24 md:pb-32">
      <div className="w-full px-8 md:px-14">
        {/* Left-aligned massive headline */}
        <div className="max-w-[70vw] md:max-w-[55vw]">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 3.4, ease: [0.76, 0, 0.24, 1] }}
            className="text-[clamp(2.5rem,8.5vw,7.5rem)] font-main font-bold leading-[0.95] tracking-[-0.03em] text-text"
          >
            Interviews don't have to feel like a lottery.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 4.2, ease: [0.76, 0, 0.24, 1] }}
            className="mt-8 md:mt-10 text-[clamp(0.85rem,1.4vw,1.05rem)] font-main font-light leading-[1.8] text-text-dim max-w-lg"
          >
            MockPilot learns what you don't know, then drills you on exactly
            that. Adaptive AI mock interviews for CS students who want to stop
            guessing and start getting offers.
          </motion.p>

          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onStartInterview();
            }}
            data-cursor="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 1, delay: 4.8, ease: [0.76, 0, 0.24, 1] }}
            className="inline-flex items-center gap-3 mt-10 text-[12px] font-main font-light tracking-[0.15em] text-text-dim hover:text-accent transition-colors duration-500 uppercase"
          >
            Start Interviewing
            <ArrowRight size={14} strokeWidth={1.5} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

const slow = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };

export default function AboutSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center py-32 md:py-40">
      <div className="w-full px-8 md:px-14">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ ...slow }}
          className="block mb-10 text-[13px] font-main font-light tracking-[0.3em] text-text-dim uppercase text-center"
        >
          What is MockPilot
        </motion.span>

        {/* Massive headline */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ ...slow, delay: 0.15 }}
          className="text-[clamp(2rem,6vw,5rem)] font-main font-bold leading-[1.0] tracking-[-0.02em] text-text max-w-[65vw] md:max-w-[50vw]"
        >
          Most interview prep is random. Yours shouldn't be.
        </motion.h2>

        {/* Body — pure editorial text, no cards, no icons */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 0.6, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...slow, delay: 0.35 }}
          className="mt-12 md:mt-16 text-[clamp(0.9rem,1.3vw,1.05rem)] font-main font-light leading-[1.9] text-text-dim max-w-lg"
        >
          Every session, MockPilot figures out where your knowledge gaps
          actually are — and sends you there. Not topic-of-the-day. Not random
          shuffle. The exact concept you're most likely to blank on when it
          counts.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...slow, delay: 0.5 }}
          className="mt-6 text-[clamp(0.9rem,1.3vw,1.05rem)] font-main font-light leading-[1.9] text-text-dim max-w-lg"
        >
          Built for CS undergrads targeting SDE, ML, and Data Science roles.
          No fluff. No filler. Just the prep that moves the needle.
        </motion.p>
      </div>
    </section>
  );
}

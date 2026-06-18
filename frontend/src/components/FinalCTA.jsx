import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const slow = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };

export default function FinalCTA({ onStartInterview }) {
  return (
    <section id="start" className="relative min-h-[70vh] w-full flex items-center py-32 md:py-40">
      <div className="w-full px-8 md:px-14">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...slow }}
          className="text-[clamp(2rem,6vw,5rem)] font-main font-bold leading-[1.0] tracking-[-0.02em] text-text max-w-[65vw] md:max-w-[50vw]"
        >
          You're still here?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 0.55, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...slow, delay: 0.2 }}
          className="mt-8 text-[clamp(0.9rem,1.3vw,1.05rem)] font-main font-light leading-[1.9] text-text-dim max-w-md"
        >
          Then you already know this is different. Stop cycling through random
          problems and start preparing like the interview actually matters.
        </motion.p>

        <motion.a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onStartInterview();
          }}
          data-cursor="cta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...slow, delay: 0.4 }}
          className="inline-flex items-center gap-3 mt-12 text-[12px] font-main font-light tracking-[0.15em] text-text-dim hover:text-accent transition-colors duration-500 uppercase"
        >
          Start Interviewing
          <ArrowRight size={14} strokeWidth={1.5} />
        </motion.a>
      </div>
    </section>
  );
}

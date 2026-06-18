import { motion } from "framer-motion";

const slow = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };

const steps = [
  {
    num: "01",
    title: "Upload your resume.\nPick your role.",
    body: "You tell us what you're applying for — SDE, ML, or Data Science. Upload your resume and MockPilot extracts your project stack, technologies, and domain experience to personalize every session.",
  },
  {
    num: "02",
    title: "Answer live questions\nby voice.",
    body: "Each session throws 7 questions at you, calibrated to your exact weak spots. You answer out loud — just like in a real interview. MockPilot transcribes and scores your response in real time using semantic AI.",
  },
  {
    num: "03",
    title: "Get scored.\nTrack growth.",
    body: "After each session, MockPilot updates your knowledge map across 19 topics. You see exactly where you improved, what slipped, and what's coming next. Every session makes the next one harder — in exactly the right way.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className="relative min-h-screen w-full flex items-center py-24 md:py-32"
        >
          <div className="w-full px-8 md:px-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-end">
              {/* Left Column: Number & Headline */}
              <div className="md:col-span-7">
                {/* Step number */}
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.15 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ ...slow }}
                  className="block text-[clamp(6rem,15vw,12rem)] font-main font-bold leading-none tracking-[-0.04em] text-text select-none"
                >
                  {step.num}
                </motion.span>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...slow, delay: 0.2 }}
                  className="mt-6 md:mt-8 text-[clamp(1.8rem,4.5vw,3.5rem)] font-main font-bold leading-[1.05] tracking-[-0.02em] text-text whitespace-pre-line"
                >
                  {step.title}
                </motion.h3>
              </div>

              {/* Right Column: Body text */}
              <div className="md:col-span-5 md:pb-3">
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 0.55, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...slow, delay: 0.4 }}
                  className="text-[clamp(1.05rem,1.5vw,1.25rem)] font-main font-light leading-[1.8] text-text-dim max-w-md"
                >
                  {step.body}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Faint divider */}
          {i < steps.length - 1 && (
            <div className="absolute bottom-0 left-8 md:left-14 right-8 md:right-14 h-px bg-border" />
          )}
        </div>
      ))}
    </section>
  );
}

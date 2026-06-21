import { useRef } from "react";
import { motion, useScroll, useMotionTemplate } from "framer-motion";

const features = [
  {
    num: "01",
    title: "Adaptive Knowledge Tracking",
    body: "Every session recalculates your competency using an Exponential Moving Average with α\u00A0=\u00A00.3. Recent accuracy is weighted heavily to capture learning curves. Your knowledge state persists across sessions.",
  },
  {
    num: "02",
    title: "Thompson Sampling",
    body: "Topic selection modeled as a multi-armed bandit. Rolling Beta distributions sample your weakness probabilistically — 60% knowledge gaps, 40% performance variance. Volatile skills surface first.",
  },
  {
    num: "03",
    title: "Dynamic Question Generation",
    body: "Llama 3.1 8B on Groq's LPU engine generates unique questions calibrated to your level. No question bank. No memorization patterns. Every question is new.",
  },
  {
    num: "04",
    title: "Semantic Evaluation",
    body: "MiniLM-L6-v2 sentence transformers calculate cosine similarity against ideal answers. Concept coverage analysis ensures key technical points were addressed. Meaning, not keywords.",
  },
  {
    num: "05",
    title: "Voice-First Interface",
    body: "Web Speech API captures your spoken response in real time. 45 seconds to think. 2 minutes to answer. Builds verbal fluency under interview conditions.",
  },
  {
    num: "06",
    title: "Resume-Aware Context",
    body: "Your resume shapes your questions. MockPilot parses your project stack and generates questions that reference your past work — asking you to defend decisions you actually made.",
  },
  {
    num: "07",
    title: "Deterministic Reports",
    body: "No vague feedback. Knowledge deltas, similarity scores, missed concepts, session analytics — everything calculated, not estimated. You know exactly where you stand.",
  },
];

export default function FeatureExhibition() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Inject the raw 0-1 progress into a native CSS calc string.
  // The browser multiplies the progress by the exact distance needed to align the track's right edge with the viewport.
  // This bypasses any Framer Motion interpolation limits and avoids React layout measurement bugs.
  const transform = useMotionTemplate`translateX(calc(${scrollYProgress} * (-100% + 100vw)))`;

  return (
    <section id="features" ref={containerRef} className="relative" style={{ height: `${features.length * 100}vh` }}>
      {/* Pinned viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Section label */}
        <div className="px-8 md:px-14 mb-8 text-center">
          <span className="text-[13px] font-main font-light tracking-[0.3em] text-text-dim uppercase opacity-60">
            What makes it different
          </span>
        </div>

        {/* Horizontal rail */}
        <motion.div
          style={{ transform }}
          className="flex flex-row flex-nowrap w-fit"
        >
          {features.map((feature) => (
            <div
              key={feature.num}
              className="shrink-0 w-[85vw] md:w-[55vw] h-[60vh] px-8 md:px-14 flex items-center"
            >
              <div className="w-full max-w-3xl">
                {/* Number */}
                <span className="block text-[10px] font-main font-light tracking-[0.3em] text-text-muted mb-6">
                  {feature.num} / 07
                </span>

                {/* Title */}
                <h3 className="text-[clamp(1.8rem,4vw,3.2rem)] font-main font-bold leading-[1.05] tracking-[-0.02em] text-text mb-6">
                  {feature.title}
                </h3>

                {/* Horizontal rule */}
                <div className="w-16 h-px bg-border mb-8" />

                {/* Body */}
                <p className="text-[clamp(0.85rem,1.2vw,1rem)] font-main font-light leading-[1.9] text-text-dim max-w-lg">
                  {feature.body}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Progress indicator */}
        <div className="px-8 md:px-14 mt-8">
          <div className="w-32 h-px bg-border relative overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="absolute inset-0 bg-text origin-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

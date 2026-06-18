import { motion } from "framer-motion";

const slow = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };

const roles = [
  {
    title: "SDE",
    full: "Software Development Engineer",
    body: "System design, algorithms, data structures, and coding patterns for SDE-1 and SDE-2 roles. Emphasis on scalability, concurrency, and real-world architecture.",
  },
  {
    title: "ML / AI",
    full: "Machine Learning Engineer",
    body: "ML theory, model architectures, optimization, and math fundamentals. Covers neural networks, transformers, evaluation metrics, and statistical learning.",
  },
  {
    title: "Data Science",
    full: "Data Scientist",
    body: "Statistics, data manipulation, SQL, hypothesis testing, and business reasoning. Focus on practical problem-solving and communication of insights.",
  },
];

export default function ForWhoSection() {
  return (
    <section id="for-who" className="relative min-h-screen w-full flex items-center py-32 md:py-40">
      <div className="w-full px-8 md:px-14">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ ...slow }}
          className="block mb-10 text-[13px] font-main font-light tracking-[0.3em] text-text-dim uppercase text-center"
        >
          Built for
        </motion.span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...slow, delay: 0.15 }}
          className="text-[clamp(2rem,5.5vw,4.5rem)] font-main font-bold leading-[1.0] tracking-[-0.02em] text-text max-w-[60vw] md:max-w-[45vw] mb-20 md:mb-28"
        >
          Know which seat you're in.
        </motion.h2>

        {/* Roles — editorial list, not card grid */}
        <div className="space-y-0">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...slow, delay: i * 0.1 }}
              className="py-10 md:py-14 border-t border-border group"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Left — title */}
                <div className="md:w-1/3">
                  <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-main font-bold text-text-dim group-hover:text-text transition-colors duration-700">
                    {role.title}
                  </h3>
                  <span className="block mt-2 text-[11px] font-main font-light tracking-[0.12em] text-text-muted">
                    {role.full}
                  </span>
                </div>

                {/* Right — description */}
                <p className="md:w-1/2 text-[clamp(1.05rem,1.5vw,1.25rem)] font-main font-light leading-[1.8] text-text-dim">
                  {role.body}
                </p>
              </div>
            </motion.div>
          ))}
          {/* Final border */}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}

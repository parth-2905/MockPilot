import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

import CustomCursor from "./components/CustomCursor";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import HowItWorks from "./components/HowItWorks";
import FeatureExhibition from "./components/FeatureExhibition";
import ForWhoSection from "./components/ForWhoSection";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";

import { supabase } from "./lib/supabaseClient";
import bgImage from "./assets/bg-atmosphere.png";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  /* Restore session on load (handles OAuth redirect + existing sessions) */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* Lenis smooth scroll */
  useEffect(() => {
    if (loading) return;

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [loading]);

  return (
    <>
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Layer 0: Atmospheric background image */}
          <div
            className="atmosphere-bg"
            style={{ backgroundImage: `url(${bgImage})` }}
          />

          {/* Root-level custom cursor so it stays on top of all modal overlays */}
          <CustomCursor />

          {user ? (
            /* Dashboard View */
            <div className="relative z-10 min-h-screen flex flex-col">
              <Dashboard
                user={user}
                onLogout={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
              />
            </div>
          ) : (
            /* Landing Page View */
            <div className="content-layer min-h-screen flex flex-col">
              <Navbar onStartInterview={() => setIsAuthModalOpen(true)} />

              <main className="flex-grow">
                <Hero onStartInterview={() => setIsAuthModalOpen(true)} />
                <AboutSection />
                <HowItWorks />
                <FeatureExhibition />
                <ForWhoSection />
                <FinalCTA onStartInterview={() => setIsAuthModalOpen(true)} />
              </main>

              <Footer />
            </div>
          )}

          {/* Authentication modal overlay */}
          <AnimatePresence>
            {isAuthModalOpen && (
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={(userData) => {
                  setUser(userData);
                  setIsAuthModalOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
import { useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowRight, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess(data.user);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) {
          setError("An account with this email already exists.");
        } else {
          setMessage("Check your email for a confirmation link!");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050505]/75 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        className="relative w-full max-w-[420px] bg-[#050505] border border-border p-8 md:p-10 rounded-none shadow-2xl z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-dim hover:text-text transition-colors duration-300"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {/* Title */}
        <span className="block text-[10px] font-main font-bold tracking-[0.3em] text-text-muted uppercase mb-2">
          MockPilot Cockpit
        </span>
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-main font-bold text-text leading-tight tracking-tight mb-8">
          {isLogin ? "Welcome back." : "Enter the cockpit."}
        </h2>

        {error && (
          <div className="mb-6 px-4 py-3 border border-red-500/20 bg-red-500/5 text-red-400 text-[12px] font-main font-light leading-normal">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 px-4 py-3 border border-green-500/20 bg-green-500/5 text-green-400 text-[12px] font-main font-light leading-normal">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 relative">
            <span className="text-[9px] font-main font-bold tracking-wider text-text-muted uppercase block">
              Email Address
            </span>
            <div className="flex items-center border-b border-border focus-within:border-text transition-colors duration-500 py-2">
              <Mail size={14} className="text-text-muted mr-3" />
              <input
                required
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none text-[13px] text-text font-main font-light outline-none placeholder:text-text-muted/40"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <span className="text-[9px] font-main font-bold tracking-wider text-text-muted uppercase block">
              Password
            </span>
            <div className="flex items-center border-b border-border focus-within:border-text transition-colors duration-500 py-2">
              <Lock size={14} className="text-text-muted mr-3" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none text-[13px] text-text font-main font-light outline-none placeholder:text-text-muted/40"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex items-center justify-between border border-border px-6 py-4 hover:bg-text hover:text-bg transition-all duration-500 group disabled:opacity-50"
          >
            <span className="text-[11px] font-main font-medium tracking-[0.15em] uppercase">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  Authenticating...
                </span>
              ) : isLogin ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </span>
            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative px-3 bg-[#050505] text-[9px] uppercase font-main font-bold tracking-[0.2em] text-text-muted">
            or
          </span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-border px-6 py-4 hover:bg-text hover:text-bg transition-all duration-500 group"
        >
          <svg className="w-4 h-4 fill-current transition-colors duration-500" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="text-[11px] font-main font-medium tracking-[0.15em] uppercase">
            Continue with Google
          </span>
        </button>

        {/* Toggle login/signup */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-[11px] font-main font-light tracking-wide text-text-dim hover:text-text transition-colors duration-300"
          >
            {isLogin ? (
              <>
                New candidate? <span className="border-b border-text-dim hover:border-text">Sign up →</span>
              </>
            ) : (
              <>
                Existing user? <span className="border-b border-text-dim hover:border-text">Log in →</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
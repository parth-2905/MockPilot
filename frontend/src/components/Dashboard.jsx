import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, LogOut, Upload, FileText, X,
  ChevronDown, ChevronUp, Mic, MicOff, AlertCircle
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { createClient } from "@supabase/supabase-js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API = import.meta.env.VITE_API_URL || "https://mockpilot-tnme.onrender.com";

const TOPICS = [
  { id: 1, name: "System Design", short: "Sys Design" },
  { id: 2, name: "Distributed Systems", short: "Distributed" },
  { id: 3, name: "Database Internals", short: "Databases" },
  { id: 4, name: "Concurrency", short: "Concurrency" },
  { id: 5, name: "Low Level Design", short: "LLD" },
  { id: 6, name: "Arrays & Hashing", short: "Arrays" },
  { id: 7, name: "Two Pointers", short: "Two Ptr" },
  { id: 8, name: "Sliding Window", short: "Sliding Win" },
  { id: 9, name: "Stack & Queues", short: "Stacks" },
  { id: 10, name: "Binary Search", short: "Bin Search" },
  { id: 11, name: "Linked Lists", short: "Linked Lists" },
  { id: 12, name: "Trees & BSTs", short: "Trees" },
  { id: 13, name: "Tries", short: "Tries" },
  { id: 14, name: "Graphs", short: "Graphs" },
  { id: 15, name: "Dynamic Programming", short: "DP" },
  { id: 16, name: "Greedy Algorithms", short: "Greedy" },
  { id: 17, name: "Bit Manipulation", short: "Bit Manip" },
  { id: 18, name: "ML Theory", short: "ML Theory" },
  { id: 19, name: "Transformers & NLP", short: "Transformers" },
];

const EASE = [0.76, 0, 0.24, 1];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score) {
  if (score >= 0.7) return "#34c05a";
  if (score >= 0.5) return "#e8b84b";
  return "#e05252";
}

function scoreLabel(score) {
  if (score >= 0.7) return "Strong";
  if (score >= 0.5) return "Developing";
  return "Needs Work";
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function avgScore(answers) {
  if (!answers?.length) return 0;
  return answers.reduce((s, a) => s + (a.final ?? 0), 0) / answers.length;
}

// Responsive layout is handled entirely by CSS media queries in index.css
// See .dash-* classes and @media breakpoints

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// ---- Radar Chart -----------------------------------------------------------

function KnowledgeRadar({ topicStates }) {
  const knowledgeMap = {};
  topicStates.forEach(ts => { knowledgeMap[ts.topic_id] = ts.knowledge; });

  const displayed = topicStates.map(ts => ({
    id: ts.topic_id,
    short: ts.topics?.name
      ? (ts.topics.name.length > 15 ? ts.topics.name.substring(0, 12) + "..." : ts.topics.name)
      : "Topic"
  }));
  const data = topicStates.map(ts => Math.round((ts.knowledge ?? 0.5) * 100));

  const chartData = {
    labels: displayed.map(t => t.short),
    datasets: [{
      data,
      backgroundColor: "rgba(52, 192, 90, 0.07)",
      borderColor: "#34c05a",
      borderWidth: 1.5,
      pointBackgroundColor: "#34c05a",
      pointRadius: 3,
      pointBorderWidth: 0,
      pointHoverRadius: 5,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, tooltip: {
        backgroundColor: "#0f0f0f",
        borderColor: "#222",
        borderWidth: 1,
        titleColor: "#666",
        bodyColor: "#f5f2ea",
        callbacks: {
          label: ctx => ` ${ctx.raw}% knowledge`
        }
      }
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: "#1a1a1a" },
        angleLines: { color: "#1a1a1a" },
        pointLabels: {
          color: "#555",
          font: { size: 10, family: "inherit" },
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "280px" }}>
      <Radar data={chartData} options={options} />
    </div>
  );
}

// ---- Stats Row -------------------------------------------------------------

function StatsRow({ topicStates, sessionCount }) {
  if (!topicStates.length) return null;

  const sorted = [...topicStates].sort((a, b) => b.knowledge - a.knowledge);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const prepLevel = Math.round(
    (topicStates.reduce((s, t) => s + t.knowledge, 0) / topicStates.length) * 100
  );

  const strongTopicName = strongest?.topics?.name ?? strongest?.topic_name ?? "—";
  const weakTopicName = weakest?.topics?.name ?? weakest?.topic_name ?? "—";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", marginBottom: "1.25rem" }}>
      {[
        { label: "Prep Level", val: `${prepLevel}%`, sub: scoreLabel(prepLevel / 100) },
        { label: "Strongest", val: strongTopicName.length > 12 ? strongTopicName.substring(0, 10) + "..." : strongTopicName, sub: `${Math.round((strongest?.knowledge ?? 0) * 100)}%` },
        { label: "Weakest", val: weakTopicName.length > 12 ? weakTopicName.substring(0, 10) + "..." : weakTopicName, sub: `${Math.round((weakest?.knowledge ?? 0) * 100)}%` },
      ].map(s => (
        <div key={s.label} style={{
          background: "#0d0d0d", border: "0.5px solid #1e1e1e",
          borderRadius: "8px", padding: "0.65rem 0.85rem"
        }}>
          <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#f5f2ea", marginTop: "3px", lineHeight: 1.2 }}>{s.val}</div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Session History -------------------------------------------------------

function SessionHistory({ sessions, loading }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div style={{ padding: "2rem 0", textAlign: "center", color: "#333", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Loading sessions...
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div style={{
        border: "0.5px solid #1a1a1a", borderRadius: "8px",
        padding: "2.5rem 1.5rem", textAlign: "center"
      }}>
        <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.7, maxWidth: "280px", margin: "0 auto" }}>
          Get started with a mock interview to see where you lie.
        </div>
        <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          No sessions yet
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
      {sessions.map(sess => {
        const answers = sess.answers ?? [];
        const overall = avgScore(answers);
        const isOpen = expanded === sess.id;
        const date = fmtDate(sess.completed_at || sess.started_at);

        return (
          <div key={sess.id} style={{
            border: "0.5px solid #1e1e1e", borderRadius: "8px",
            overflow: "hidden", transition: "border-color 0.3s"
          }}>
            {/* Session header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : sess.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0.85rem 1rem",
                background: "transparent", border: "none", cursor: "pointer",
                textAlign: "left", gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "6px",
                  background: "#0d0d0d", border: "0.5px solid #222",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <span style={{
                    fontSize: "13px", fontWeight: 500,
                    color: scoreColor(overall), fontFamily: "monospace"
                  }}>
                    {Math.round(overall * 100)}
                  </span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12px", color: "#f5f2ea", fontWeight: 500 }}>
                    Session — {sess.role === "sde_1" ? "SDE" : "ML / DS"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{date}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <span style={{
                  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                  color: scoreColor(overall), background: scoreColor(overall) + "18",
                  padding: "3px 8px", borderRadius: "4px"
                }}>
                  {scoreLabel(overall)}
                </span>
                {isOpen ? <ChevronUp size={13} color="#444" /> : <ChevronDown size={13} color="#444" />}
              </div>
            </button>

            {/* Expanded Q breakdown */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    borderTop: "0.5px solid #1a1a1a",
                    padding: "0.75rem 1rem 1rem",
                    display: "flex", flexDirection: "column", gap: "10px"
                  }}>
                    {answers.length === 0 && (
                      <div style={{ fontSize: "12px", color: "#333", fontStyle: "italic" }}>
                        No answer data recorded.
                      </div>
                    )}
                    {answers.map((a, i) => (
                      <div key={i} style={{
                        background: "#0a0a0a", border: "0.5px solid #1a1a1a",
                        borderRadius: "6px", padding: "0.75rem"
                      }}>
                        {/* Q header */}
                        <div style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", marginBottom: "0.5rem"
                        }}>
                          <span style={{
                            fontSize: "10px", color: "#444", textTransform: "uppercase",
                            letterSpacing: "0.1em", fontFamily: "monospace"
                          }}>
                            Q{a.question_number} · {a.is_resume ? "Resume" : a.topic_name}
                          </span>
                          <span style={{
                            fontSize: "11px", fontFamily: "monospace", fontWeight: 500,
                            color: scoreColor(a.final)
                          }}>
                            {Math.round(a.final * 100)}%
                          </span>
                        </div>

                        {/* Question text */}
                        <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6, margin: "0 0 0.5rem" }}>
                          {a.question}
                        </p>

                        {/* Score chips */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                          {[
                            { label: "Semantic", val: Math.round(a.cosine * 100) + "%" },
                            { label: "Concepts", val: Math.round(a.coverage * 100) + "%" },
                            { label: "Difficulty", val: a.difficulty },
                          ].map(chip => (
                            <span key={chip.label} style={{
                              fontSize: "10px", color: "#555",
                              background: "#111", border: "0.5px solid #1e1e1e",
                              borderRadius: "4px", padding: "2px 7px"
                            }}>
                              {chip.label}: <span style={{ color: "#888" }}>{chip.val}</span>
                            </span>
                          ))}
                        </div>

                        {/* Key concepts missed */}
                        {a.key_concepts?.length > 0 && (
                          <div style={{ marginTop: "0.4rem" }}>
                            <div style={{ fontSize: "10px", color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                              Key concepts
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {a.key_concepts.map((kc, j) => (
                                <span key={j} style={{
                                  fontSize: "10px", padding: "2px 6px",
                                  borderRadius: "3px", border: "0.5px solid #222",
                                  color: "#555", background: "#0d0d0d"
                                }}>
                                  {kc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ---- Interview Overlay -----------------------------------------------------

function InterviewOverlay({ user, role, session: initialSession, onClose, onSessionComplete }) {
  // Responsive layout handled by CSS classes: dash-overlay-nav, dash-overlay-content, dash-overlay-actions, dash-eval-grid
  const [step, setStep] = useState("question");
  const [session, setSession] = useState(initialSession);           // ← use prop
  const [currentQ, setCurrentQ] = useState(initialSession);        // ← use prop
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(120);
  const [thinkSeconds, setThinkSeconds] = useState(45);
  const [thinkPhase, setThinkPhase] = useState(true);

  const recognitionRef = useRef(null);
  const waveRef = useRef(null);
  const waveAnimRef = useRef(null);

  // Think timer
  useEffect(() => {
    if (!thinkPhase || step !== "question") return;
    if (thinkSeconds <= 0) { setThinkPhase(false); return; }
    const t = setInterval(() => setThinkSeconds(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [thinkPhase, thinkSeconds, step]);

  // Record timer
  useEffect(() => {
    if (!isRecording) return;
    if (recSeconds <= 0) { stopRecording(); return; }
    const t = setInterval(() => setRecSeconds(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isRecording, recSeconds]);

  // Wave animation
  useEffect(() => {
    if (!isRecording) { cancelAnimationFrame(waveAnimRef.current); return; }
    const canvas = waveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(245,242,234,0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const env = Math.sin((x / canvas.width) * Math.PI);
        const y = canvas.height / 2 + (Math.sin(x * 0.05 + phase) * 14 + Math.sin(x * 0.02 - phase * 0.5) * 7) * env;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.15;
      waveAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(waveAnimRef.current);
  }, [isRecording]);

  // Keep-alive ping during interview
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API}/`).catch(() => { });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported in this browser."); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = e => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setUserAnswer(transcript);
    };
    rec.onerror = () => setError("Microphone error. Please type your answer instead.");
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    setRecSeconds(120);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/sessions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          topic_id: currentQ.topic_id,
          topic_name: currentQ.topic_name,
          question: currentQ.question,
          user_answer: userAnswer,
          ideal_answers: currentQ.ideal_answers,
          key_concepts: currentQ.key_concepts,
          is_resume: currentQ.is_resume,
          difficulty: currentQ.difficulty,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Save to history and move on directly — no evaluation screen
      const newEntry = {
        question_number: currentQ.question_number,
        topic_name: currentQ.topic_name,
        question: currentQ.question,
        user_answer: userAnswer,
        is_resume: currentQ.is_resume,
        key_concepts: currentQ.key_concepts ?? [],
        cosine: data.score.cosine,
        coverage: data.score.coverage,
        final: data.score.final,
        difficulty: currentQ.difficulty,
      };
      const newHistory = [...history, newEntry];
      setHistory(newHistory);

      if (data.session_complete) {
        const avg = newHistory.reduce((s, a) => s + a.final, 0) / newHistory.length;
        setOverallScore(Math.round(avg * 100));
        setStep("done");
        onSessionComplete?.();
        return;
      }

      const nq = data.next_question;
      setCurrentQ({ ...session, ...nq });
      setUserAnswer("");
      setThinkPhase(true);
      setThinkSeconds(45);
      setStep("question");

    } catch (e) {
      setError(e.message || "Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      data-lenis-prevent
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#050505", display: "flex", flexDirection: "column",
        fontFamily: "inherit", color: "#f5f2ea",
        overflowY: "auto"
      }}
    >
      {/* Overlay nav */}
      <div className="dash-overlay-nav">
        <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          MockPilot
        </span>
        {step !== "done" && currentQ && (
          <span style={{ fontSize: "11px", color: "#444", fontFamily: "monospace", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
            Q{currentQ.question_number} / {currentQ.total_questions} &nbsp;·&nbsp; {currentQ.topic_name}
          </span>
        )}
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: "6px", background: "none",
            border: "0.5px solid #222", borderRadius: "6px", padding: "6px 12px",
            color: "#555", cursor: "pointer", fontSize: "11px",
            textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0
          }}
        >
          <X size={12} /> Exit
        </button>
      </div>

      {/* Main content */}
      <div className="dash-overlay-content">
        <AnimatePresence mode="wait">

          {/* Question step */}
          {step === "question" && currentQ && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* Think / answer timer bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {thinkPhase ? "Think time" : "Answer time"}
                  </span>
                  <span style={{ fontSize: "11px", color: thinkPhase ? "#e8b84b" : "#34c05a", fontFamily: "monospace" }}>
                    {thinkPhase ? thinkSeconds : recSeconds}s
                  </span>
                </div>
                <div style={{ height: "2px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", background: thinkPhase ? "#e8b84b" : "#34c05a", borderRadius: "2px" }}
                    initial={{ width: "100%" }}
                    animate={{ width: thinkPhase ? `${(thinkSeconds / 45) * 100}%` : `${(recSeconds / 120) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Difficulty + topic */}
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{
                  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "3px 8px", borderRadius: "4px", border: "0.5px solid #222", color: "#555"
                }}>
                  {currentQ.difficulty}
                </span>
                {currentQ.is_resume && (
                  <span style={{
                    fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "3px 8px", borderRadius: "4px",
                    background: "#1a1a0a", border: "0.5px solid #2a2a10", color: "#888"
                  }}>
                    Resume
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 style={{
                fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 700,
                lineHeight: 1.35, letterSpacing: "-0.01em", color: "#f5f2ea", margin: 0
              }}>
                {currentQ.question}
              </h2>

              {/* Recording */}
              {isRecording && (
                <div style={{ border: "0.5px solid #1e1e1e", borderRadius: "8px", padding: "1rem" }}>
                  <canvas ref={waveRef} width={600} height={48} style={{ width: "100%", height: "48px" }} />
                  <div style={{ fontSize: "11px", color: "#444", marginTop: "8px", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
                    Recording · {recSeconds}s remaining
                  </div>
                </div>
              )}

              {/* Answer textarea */}
              <div>
                <div style={{ fontSize: "10px", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                  Your response
                </div>
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={isRecording}
                  rows={6}
                  placeholder={thinkPhase ? "Take your time to think..." : "Speak or type your answer..."}
                  style={{
                    width: "100%", background: "#0a0a0a",
                    border: "0.5px solid #1e1e1e", borderRadius: "8px",
                    color: "#f5f2ea", padding: "0.85rem 1rem",
                    fontSize: "14px", lineHeight: 1.7, outline: "none",
                    resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.3s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#333"}
                  onBlur={e => e.target.style.borderColor = "#1e1e1e"}
                />
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e05252", fontSize: "12px" }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Actions */}
              <div className="dash-overlay-actions">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={thinkPhase}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    border: `0.5px solid ${isRecording ? "#3a1a1a" : "#1e1e1e"}`,
                    background: isRecording ? "#1a0a0a" : "transparent",
                    color: isRecording ? "#e05252" : "#555",
                    borderRadius: "8px", padding: "0.75rem 1.25rem",
                    cursor: thinkPhase ? "not-allowed" : "pointer",
                    fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em",
                    opacity: thinkPhase ? 0.4 : 1, transition: "all 0.3s"
                  }}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                  {isRecording ? "Stop" : "Record"}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !userAnswer.trim() || thinkPhase}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    border: "0.5px solid #2a2a2a", borderRadius: "8px",
                    padding: "0.75rem 1.25rem", background: "transparent",
                    color: "#f5f2ea", cursor: "pointer", fontSize: "11px",
                    textTransform: "uppercase", letterSpacing: "0.15em",
                    opacity: (loading || !userAnswer.trim() || thinkPhase) ? 0.4 : 1,
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={e => { if (!loading && userAnswer.trim() && !thinkPhase) { e.currentTarget.style.background = "#f5f2ea"; e.currentTarget.style.color = "#050505"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f2ea"; }}
                >
                  <span>{loading ? "Evaluating..." : "Submit Answer"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Evaluation step */}
          {step === "evaluation" && evaluation && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace" }}>
                Semantic evaluation · Q{currentQ.question_number}
              </div>

              {/* Big score */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{
                  fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 700,
                  fontFamily: "monospace", lineHeight: 1,
                  color: scoreColor(evaluation.score.final)
                }}>
                  {Math.round(evaluation.score.final * 100)}
                </span>
                <span style={{ fontSize: "14px", color: "#444" }}>/ 100</span>
              </div>

              {/* Score breakdown */}
              <div className="dash-eval-grid">
                {[
                  { label: "Semantic Similarity", val: Math.round(evaluation.score.cosine * 100) + "%" },
                  { label: "Concept Coverage", val: Math.round(evaluation.score.coverage * 100) + "%" },
                  { label: "Llama Verified", val: evaluation.score.groq_verified ? "Yes" : "No" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#0d0d0d", border: "0.5px solid #1e1e1e",
                    borderRadius: "8px", padding: "0.75rem"
                  }}>
                    <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{s.label}</div>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#f5f2ea", fontFamily: "monospace" }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Knowledge delta */}
              {evaluation.state && (
                <div style={{ border: "0.5px solid #1e1e1e", borderRadius: "8px", padding: "0.85rem 1rem" }}>
                  <div style={{ fontSize: "10px", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                    Topic state update · {currentQ.topic_name}
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {[
                      { label: "Knowledge", val: Math.round(evaluation.state.knowledge * 100) + "%" },
                      { label: "Confidence", val: Math.round(evaluation.state.confidence * 100) + "%" },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: "10px", color: "#444" }}>{s.label}</div>
                        <div style={{ fontSize: "16px", fontWeight: 500, color: "#f5f2ea", fontFamily: "monospace" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleNext}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  border: "0.5px solid #2a2a2a", borderRadius: "8px",
                  padding: "0.85rem 1.25rem", background: "transparent",
                  color: "#f5f2ea", cursor: "pointer", fontSize: "11px",
                  textTransform: "uppercase", letterSpacing: "0.15em", transition: "all 0.3s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f2ea"; e.currentTarget.style.color = "#050505"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f2ea"; }}
              >
                <span>{evaluation.session_complete ? "View Session Report" : "Next Question"}</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>
          )}

          {/* Done / report step */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Session complete
              </div>

              <div>
                <div style={{ fontSize: "10px", color: "#333", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Overall score
                </div>
                <span style={{
                  fontSize: "clamp(4rem, 12vw, 7rem)", fontWeight: 700,
                  fontFamily: "monospace", lineHeight: 1,
                  color: scoreColor(overallScore / 100)
                }}>
                  {overallScore}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.map((a, i) => (
                  <div key={i} style={{
                    background: "#0a0a0a", border: "0.5px solid #1a1a1a",
                    borderRadius: "8px", padding: "0.75rem 1rem",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px"
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "10px", color: "#444", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "4px" }}>
                        Q{a.question_number} · {a.is_resume ? "Resume" : a.topic_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
                        {a.question}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "16px", fontWeight: 500, fontFamily: "monospace",
                      color: scoreColor(a.final), flexShrink: 0
                    }}>
                      {Math.round(a.final * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  border: "0.5px solid #2a2a2a", borderRadius: "8px",
                  padding: "0.85rem 1.25rem", background: "transparent",
                  color: "#f5f2ea", cursor: "pointer", fontSize: "11px",
                  textTransform: "uppercase", letterSpacing: "0.15em", transition: "all 0.3s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f2ea"; e.currentTarget.style.color = "#050505"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f2ea"; }}
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard({ user, onLogout }) {
  const [role, setRole] = useState("sde_1");
  const [topicStates, setTopicStates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);


  // Right panel state
  const [resumeB64, setResumeB64] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  // Interview overlay
  const [activeSession, setActiveSession] = useState(null);
  const [showInterview, setShowInterview] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch topic states
  const fetchTopicStates = useCallback(async () => {
    if (!user?.id) return;
    setLoadingStates(true);
    try {
      const { data } = await supabase
        .from("user_topic_state")
        .select(`
          topic_id,
          knowledge,
          variance,
          confidence,
          attempts,
          topics:topic_id (
            id,
            name,
            ml_ds_weight,
            sde_weight
          )
        `)
        .eq("user_id", user.id);

      const filtered = (data ?? []).filter(ts => {
        const t = ts.topics;
        if (!t) return false;
        const weight = role === "ml_ds" ? t.ml_ds_weight : t.sde_weight;
        return weight > 0;
      });

      setTopicStates(filtered);
    } catch (e) {
      console.error("Failed to fetch topic states", e);
    } finally {
      setLoadingStates(false);
    }
  }, [user?.id, role]);

  // Fetch past sessions
  const fetchSessions = useCallback(async () => {
    if (!user?.id) return;
    setLoadingSessions(true);
    try {
      const { data } = await supabase
        .from("sessions")
        .select("id, role, status, answers, started_at, completed_at")
        .eq("user_id", user.id)
        .eq("role", role)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      const parsed = (data ?? []).map(s => ({
        ...s,
        answers: typeof s.answers === "string" ? JSON.parse(s.answers) : (s.answers ?? [])
      }));
      setSessions(parsed);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setLoadingSessions(false);
    }
  }, [user?.id, role]);

  useEffect(() => { fetchTopicStates(); fetchSessions(); }, [fetchTopicStates, fetchSessions]);
  // Keep backend alive
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API}/`).catch(() => { });
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeLoading(true);
    setResumeError("");
    setResumeName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setResumeB64(reader.result.split(",")[1]);
      setResumeLoading(false);
    };
    reader.onerror = () => {
      setResumeError("Failed to read file.");
      setResumeLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStartSession = async () => {
    if (!resumeB64) { setResumeError("Upload your resume to personalise the session."); return; }
    setStartingSession(true);
    setResumeError("");
    try {
      const res = await fetch(`${API}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, role, resume_b64: resumeB64 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setActiveSession(data);
      setShowInterview(true);
    } catch (e) {
      setResumeError(e.message || "Failed to start session.");
    } finally {
      setStartingSession(false);
    }
  };

  const handleInterviewClose = () => {
    setShowInterview(false);
    setActiveSession(null);
    fetchTopicStates();
    fetchSessions();
  };

  return (
    <>
      <div className="dash-root" style={{ background: "transparent" }}>
        {/* Header */}
        <header className="dash-header">
          <div className="dash-header-left">
            <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              MockPilot
            </span>
            <div className="dash-header-divider" />
            <span style={{ fontSize: "11px", color: "#333", fontWeight: 300 }}>
              Console // {user?.email?.split("@")[0]}
            </span>
          </div>

          <div className="dash-header-right">
            <div style={{ display: "flex", border: "0.5px solid #1e1e1e", borderRadius: "6px", overflow: "hidden" }}>
              {[["sde_1", "SDE"], ["ml_ds", "ML / DS"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRole(val)}
                  style={{
                    fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "6px 14px", border: "none", cursor: "pointer",
                    background: role === val ? "#f5f2ea" : "transparent",
                    color: role === val ? "#050505" : "#444",
                    transition: "all 0.4s", fontFamily: "inherit"
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={onLogout}
              style={{
                display: "flex", alignItems: "center", gap: "6px", background: "none",
                border: "none", cursor: "pointer", color: "#333", fontSize: "11px",
                textTransform: "uppercase", letterSpacing: "0.12em",
                transition: "color 0.3s", fontFamily: "inherit"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#f5f2ea"}
              onMouseLeave={e => e.currentTarget.style.color = "#333"}
            >
              Sign Out <LogOut size={12} />
            </button>
          </div>
        </header>

        {/* Grid */}
        <div className="dash-grid">

          {/* Left — Analysis */}
          <div className="dash-analysis">
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em",
              color: "#f5f2ea", textTransform: "uppercase"
            }}>
              // Adaptive Knowledge Map
            </span>

            {loadingStates ? (
              <div style={{ padding: "3rem 0", textAlign: "center", fontSize: "11px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Loading...
              </div>
            ) : (
              <>
                <StatsRow topicStates={topicStates} sessionCount={sessions.length} />
                {topicStates.length > 0
                  ? <KnowledgeRadar topicStates={topicStates} />
                  : (
                    <div style={{
                      border: "0.5px solid #1a1a1a", borderRadius: "8px",
                      padding: "3rem 1.5rem", textAlign: "center"
                    }}>
                      <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.7 }}>
                        Get started with a mock interview to see where you lie.
                      </div>
                    </div>
                  )
                }
              </>
            )}

            {/* Session history */}
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{
                display: "block", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", color: "#f5f2ea",
                textTransform: "uppercase", marginBottom: "1rem"
              }}>
                // Past Sessions ({sessions.length})
              </span>
              <SessionHistory sessions={sessions} loading={loadingSessions} />
            </div>
          </div>

          {/* Right — Launch */}
          <div className="dash-launch">
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em",
              color: "#f5f2ea", textTransform: "uppercase"
            }}>
              // New Session
            </span>

            <div>
              <h3 className="dash-launch-title" style={{ fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 6px" }}>
                Ready to fly?
              </h3>
              <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                Upload your resume and start a 7-question adaptive session.
              </p>
            </div>

            {/* Resume upload */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" style={{ display: "none" }} />

            {resumeName ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                border: "0.5px solid #1e1e1e", borderRadius: "8px", padding: "0.65rem 0.85rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <FileText size={14} color="#444" />
                  <span style={{ fontSize: "11px", color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {resumeName}
                  </span>
                </div>
                <button
                  onClick={() => { setResumeName(""); setResumeB64(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: "2px", flexShrink: 0 }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: "6px",
                  border: "0.5px dashed #1e1e1e", borderRadius: "8px",
                  padding: "1.5rem 1rem", background: "transparent",
                  cursor: "pointer", transition: "border-color 0.3s"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}
              >
                <Upload size={16} color="#333" />
                <span style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {resumeLoading ? "Reading..." : "Upload Resume (PDF)"}
                </span>
              </button>
            )}

            {resumeError && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "#e05252", fontSize: "11px", lineHeight: 1.5 }}>
                <AlertCircle size={12} style={{ flexShrink: 0, marginTop: "1px" }} />
                {resumeError}
              </div>
            )}

            <button
              onClick={handleStartSession}
              disabled={startingSession || !resumeB64}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                border: "0.5px solid #2a2a2a", borderRadius: "8px",
                padding: "0.75rem 1rem", background: "transparent",
                color: "#f5f2ea", cursor: "pointer", fontSize: "11px",
                textTransform: "uppercase", letterSpacing: "0.15em",
                opacity: (startingSession || !resumeB64) ? 0.4 : 1,
                transition: "all 0.3s", fontFamily: "inherit"
              }}
              onMouseEnter={e => { if (!startingSession && resumeB64) { e.currentTarget.style.background = "#f5f2ea"; e.currentTarget.style.color = "#050505"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f2ea"; }}
            >
              <span>{startingSession ? "Calibrating..." : "Start Session"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Interview Overlay */}
      <AnimatePresence>
        {showInterview && activeSession && (
          <InterviewOverlay
            user={user}
            role={role}
            session={activeSession}
            onClose={handleInterviewClose}
            onSessionComplete={() => { }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
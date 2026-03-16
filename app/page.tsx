"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/ChatMessage";
import LoadingMessage from "@/components/LoadingMessage";
import { queryFabric } from "@/lib/query-client";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  tableData?: { columns: string[]; rows: unknown[][] };
  timestamp: Date;
};

const EXAMPLE_QUERIES = [
  "How did Wilmslow perform last week vs the week before?",
  "What's the cancellation rate by clinic this month?",
  "Show me the top 5 clinics by revenue in Q1",
  "Which practitioners had the most appointments in February?",
  "What's the average invoice value per service type?",
  "How many new patients did we see across all clinics this year?",
];

const CLINICS = [
  "All Clinics",
  "Wilmslow",
  "London Harley St",
  "London City",
  "Birmingham",
  "Manchester",
  "Leeds",
  "Bristol",
  "Edinburgh",
];

const LOADING_STEPS = [
  "Interpreting your question...",
  "Generating SQL...",
  "Running against Fabric...",
  "Composing response...",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("All Clinics");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startLoadingSteps = () => {
    setLoadingStep(0);
    let step = 0;
    loadingIntervalRef.current = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 950);
  };

  const stopLoadingSteps = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    startLoadingSteps();

    try {
      const data = await queryFabric(
        text.trim(),
        selectedClinic === "All Clinics" ? null : selectedClinic
      );

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer ?? "Sorry, I couldn't get an answer for that.",
          sql: data.sql,
          tableData: data.tableData,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong connecting to the data layer. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, selectedClinic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#fafaf8", fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        backgroundColor: "#1a8a8a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
      }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: 12, height: 58 }}>

          {/* ── TMC Logo ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Mole icon mark */}
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              {/* Simplified mole/circle mark */}
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="rgba(255,255,255,0.9)"/>
                <circle cx="16" cy="16" r="7" fill="#1a8a8a"/>
                <circle cx="16" cy="16" r="3" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>

            {/* Text logo: THE / MOLE / Clinic stacked */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
              <span style={{
                fontSize: 9.5, fontWeight: 300, color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.28em", textTransform: "uppercase"
              }}>The</span>
              <span style={{
                fontSize: 18, fontWeight: 700, color: "white",
                letterSpacing: "0.12em", textTransform: "uppercase",
                lineHeight: 1.05, margin: "1px 0"
              }}>MOLE</span>
              <span style={{
                fontSize: 9.5, fontWeight: 300, color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.22em", textTransform: "uppercase"
              }}>Clinic</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)", marginLeft: 4 }} />

            {/* App name */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.95)", letterSpacing: "0.01em" }}>
                Info Centre
              </span>
              <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 1, letterSpacing: "0.01em" }}>
                Fabric data · AI powered
              </span>
            </div>
          </div>

          {/* ── Right controls ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Fabric status badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 99,
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)"
            }}>
              <span className="pulse-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: "#7eeaea", flexShrink: 0
              }} />
              <span style={{ fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>
                Fabric Connected
              </span>
            </div>

            {/* Clinic selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                style={{
                  fontSize: 12.5, fontWeight: 500, color: "white",
                  border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8,
                  padding: "5px 26px 5px 10px",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  cursor: "pointer", appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 7px center",
                  outline: "none", fontFamily: "inherit"
                }}
              >
                {CLINICS.map((c) => <option key={c} style={{ color: "#2d3436", backgroundColor: "white" }}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "24px 20px" }}>

          {isEmpty ? (
            /* Empty state */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg, #e6f5f5 0%, #c0e4e4 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a8a8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#2d3436", marginBottom: 8 }}>
                Ask anything about your clinics
              </h2>
              <p style={{ fontSize: 14, color: "#636e72", marginBottom: 32, maxWidth: 380, lineHeight: 1.6 }}>
                Questions in plain English — I&apos;ll query your Microsoft Fabric data and give you a clear answer with the supporting data.
              </p>

              {/* 2-column example grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 10, width: "100%", maxWidth: 680
              }}>
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: "left", padding: "12px 16px",
                      borderRadius: 12, backgroundColor: "white",
                      border: "1px solid #e8e6e1", fontSize: 13.5,
                      color: "#2d3436", cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit", lineHeight: 1.4,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a8a8a";
                      (e.currentTarget as HTMLButtonElement).style.color = "#1a8a8a";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(26,138,138,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8e6e1";
                      (e.currentTarget as HTMLButtonElement).style.color = "#2d3436";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message thread */
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <LoadingMessage step={LOADING_STEPS[loadingStep]} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <footer style={{
        flexShrink: 0, backgroundColor: "white",
        borderTop: "1px solid #e8e6e1",
        boxShadow: "0 -1px 4px rgba(0,0,0,0.04)"
      }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "14px 20px" }}>

          {/* Suggestion chips (after first message) */}
          {!isEmpty && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
              {EXAMPLE_QUERIES.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 500,
                    padding: "5px 12px", borderRadius: 99,
                    backgroundColor: "#e6f5f5", color: "#1a8a8a",
                    border: "1px solid #b3e0e0", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "all 0.15s ease",
                    fontFamily: "inherit"
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a8a8a";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a8a8a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e6f5f5";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1a8a8a";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#b3e0e0";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your clinic data..."
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1, resize: "none", borderRadius: 14,
                border: "1.5px solid #e0ddd8", padding: "11px 16px",
                fontSize: 14, lineHeight: 1.5, color: "#2d3436",
                backgroundColor: "white", outline: "none",
                fontFamily: "inherit", minHeight: 46, maxHeight: 120,
                transition: "border-color 0.15s ease",
                opacity: isLoading ? 0.6 : 1
              }}
              onFocus={(e) => { e.target.style.borderColor = "#1a8a8a"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e0ddd8"; }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                flexShrink: 0, width: 46, height: 46,
                borderRadius: 12, border: "none", cursor: "pointer",
                background: (!input.trim() || isLoading)
                  ? "#d4d0c8"
                  : "linear-gradient(135deg, #1a8a8a 0%, #14706f 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
                boxShadow: (!input.trim() || isLoading) ? "none" : "0 2px 8px rgba(26,138,138,0.3)"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/>
              </svg>
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 11.5, color: "#b0aa9f", textAlign: "center" }}>
            Scoped to&nbsp;
            <span style={{ fontWeight: 500, color: "#636e72" }}>{selectedClinic}</span>
            &nbsp;·&nbsp;Enter to send, Shift+Enter for new line
          </div>
        </div>
      </footer>
    </div>
  );
}

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
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmpty = messages.length === 0;

  // Inline SVG chevron for the select dropdown (URL-encoded for background-image)
  const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    // app-shell: flex column, full dvh height — the messaging-app layout
    <div className="app-shell">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ flexShrink: 0, backgroundColor: "#1a8a8a", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
        {/* hdr-inner: flex row on desktop, flex column on mobile */}
        <div className="hdr-inner">

          {/* ── Logo group (always a flex row) ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {/* Mole icon mark */}
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="rgba(255,255,255,0.9)"/>
                <circle cx="16" cy="16" r="7" fill="#1a8a8a"/>
                <circle cx="16" cy="16" r="3" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>

            {/* THE / MOLE / Clinic stacked */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
              <span style={{ fontSize: 9.5, fontWeight: 300, color: "rgba(255,255,255,0.75)", letterSpacing: "0.28em", textTransform: "uppercase" }}>The</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.05, margin: "1px 0" }}>MOLE</span>
              <span style={{ fontSize: 9.5, fontWeight: 300, color: "rgba(255,255,255,0.75)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Clinic</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)", marginLeft: 4 }} />

            {/* App name */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.95)", letterSpacing: "0.01em" }}>Info Centre</span>
              <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 1, letterSpacing: "0.01em" }}>Fabric data · AI powered</span>
            </div>
          </div>

          {/* ── Right controls: hdr-controls becomes space-between on mobile ── */}
          <div className="hdr-controls">
            {/* Fabric status badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 99,
              backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)"
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7eeaea", flexShrink: 0 }} />
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
              {/* clinic-select: touch-friendly sizing from CSS, color from inline */}
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="clinic-select"
                style={{ backgroundImage: chevronSvg }}
              >
                {CLINICS.map((c) => (
                  <option key={c} style={{ color: "#2d3436", backgroundColor: "white" }}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages (flex: 1, scrolls internally) ──────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* msgs-inner: responsive padding */}
        <div className="msgs-inner">
          {isEmpty ? (
            /* ── Empty state ── */
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
                Questions in plain English — I&apos;ll query your Fabric data and give you a clear answer with the supporting data.
              </p>

              {/* query-grid: 2-col desktop, 1-col mobile */}
              <div className="query-grid">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: "left", padding: "12px 16px", borderRadius: 12,
                      backgroundColor: "white", border: "1px solid #e8e6e1",
                      fontSize: 14, color: "#2d3436", cursor: "pointer",
                      transition: "all 0.15s ease", fontFamily: "inherit",
                      lineHeight: 1.4, boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
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
            /* ── Message thread ── */
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

      {/* ── Input bar (flex-shrink:0 keeps it pinned at bottom) ─────────── */}
      <footer style={{ flexShrink: 0, backgroundColor: "white", borderTop: "1px solid #e8e6e1", boxShadow: "0 -1px 4px rgba(0,0,0,0.04)" }}>
        {/* ftr-inner: responsive padding */}
        <div className="ftr-inner">

          {/* Suggestion chips after first message */}
          {!isEmpty && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
              {EXAMPLE_QUERIES.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 500,
                    padding: "6px 13px", borderRadius: 99,
                    backgroundColor: "#e6f5f5", color: "#1a8a8a",
                    border: "1px solid #b3e0e0", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "all 0.15s ease",
                    fontFamily: "inherit", minHeight: 34 /* touch target */
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
            {/* chat-input: font-size 16px on mobile (prevents iOS auto-zoom) */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your clinic data..."
              rows={1}
              disabled={isLoading}
              className="chat-input"
              style={{ opacity: isLoading ? 0.6 : 1 }}
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
            &nbsp;·&nbsp;Enter to send
          </div>
        </div>
      </footer>
    </div>
  );
}

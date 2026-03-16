"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import LoadingMessage from "@/components/LoadingMessage";
import ClinicSelector from "@/components/ClinicSelector";

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
    }, 900);
  };

  const stopLoadingSteps = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const sendMessage = async (text: string) => {
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
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          clinic: selectedClinic === "All Clinics" ? null : selectedClinic,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer ?? "Sorry, I couldn't get an answer for that.",
        sql: data.sql,
        tableData: data.tableData,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a6b5a] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">TMC Info Centre</h1>
              <p className="text-xs text-gray-400 leading-tight">Powered by Microsoft Fabric · Claude AI</p>
            </div>
          </div>
          <ClinicSelector
            clinics={CLINICS}
            selected={selectedClinic}
            onChange={setSelectedClinic}
          />
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f4f1] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Ask anything about your clinics
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-sm">
                Ask questions in plain English — I&apos;ll query your Fabric data and give you a clear answer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 hover:border-[#1a6b5a] hover:text-[#1a6b5a] hover:shadow-sm transition-all duration-150 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <LoadingMessage step={LOADING_STEPS[loadingStep]} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input area */}
      <footer className="flex-none bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {!isEmpty && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {EXAMPLE_QUERIES.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-none text-xs px-3 py-1.5 rounded-full bg-[#e8f4f1] text-[#1a6b5a] hover:bg-[#1a6b5a] hover:text-white transition-colors duration-150 whitespace-nowrap cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your clinic data..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b5a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32 bg-white text-gray-900 placeholder:text-gray-400"
              style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex-none w-11 h-11 rounded-xl bg-[#1a6b5a] text-white flex items-center justify-center hover:bg-[#135047] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Scoped to: <span className="font-medium text-gray-600">{selectedClinic}</span> · Press Enter to send
          </p>
        </div>
      </footer>
    </div>
  );
}

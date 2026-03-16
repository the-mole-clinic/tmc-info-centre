"use client";

import { useState } from "react";
import type { Message } from "@/app/page";
import DataTable from "./DataTable";

export default function ChatMessage({ message }: { message: Message }) {
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    if (message.sql) {
      navigator.clipboard.writeText(message.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (isUser) {
    return (
      <div className="msg-appear" style={{ display: "flex", justifyContent: "flex-end" }}>
        {/* bubble-user: max-width from CSS (72% desktop → 88% mobile) */}
        <div className="bubble-user" style={{
          background: "linear-gradient(135deg, #1a8a8a 0%, #14706f 100%)",
          color: "white", borderRadius: "18px 18px 4px 18px",
          padding: "11px 16px",
          boxShadow: "0 2px 8px rgba(26,138,138,0.25)",
          fontSize: 14, lineHeight: 1.55,
          whiteSpace: "pre-wrap", wordBreak: "break-word"
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-appear" style={{ display: "flex", justifyContent: "flex-start" }}>
      {/* bubble-asst: max-width from CSS (85% desktop → 100% mobile) */}
      <div className="bubble-asst" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Avatar + answer card */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Avatar */}
          <div style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #e6f5f5 0%, #c0e4e4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: 2, border: "1px solid #b3e0e0"
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a8a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          {/* Answer card */}
          <div style={{
            flex: 1, backgroundColor: "white", borderRadius: "4px 18px 18px 18px",
            padding: "13px 16px",
            border: "1px solid #e8e6e1",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            minWidth: 0 /* prevent flex overflow */
          }}>
            <MarkdownText text={message.content} />
          </div>
        </div>

        {/* Data table — msg-indent: 40px desktop, 8px mobile */}
        {message.tableData && message.tableData.rows.length > 0 && (
          <div className="msg-indent">
            <DataTable columns={message.tableData.columns} rows={message.tableData.rows} />
          </div>
        )}

        {/* SQL toggle — msg-indent: 40px desktop, 8px mobile */}
        {message.sql && (
          <div className="msg-indent">
            <button
              onClick={() => setSqlExpanded(!sqlExpanded)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, color: "#9b9590", background: "none",
                border: "none", cursor: "pointer", padding: 0,
                fontFamily: "inherit", transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1a8a8a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9b9590"; }}
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: "transform 0.2s ease", transform: sqlExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
              {sqlExpanded ? "Hide SQL" : "View generated SQL"}
            </button>

            {sqlExpanded && (
              // No overflow:hidden here — that would prevent the inner scroll from working.
              // Border-radius still applies to the background; content can scroll.
              <div style={{
                marginTop: 8, backgroundColor: "#1e1e1e",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
              }}>
                {/* Code header: traffic lights + copy button */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px 12px 0 0",
                  backgroundColor: "#1e1e1e" /* ensure top corners are dark */
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>T-SQL</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 11, color: copied ? "#27c93f" : "rgba(255,255,255,0.45)",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "inherit", transition: "color 0.2s ease"
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Code body: scrolls horizontally on narrow screens */}
                <div style={{ overflowX: "auto", padding: "14px 16px", borderRadius: "0 0 12px 12px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                  <pre className="sql-block" style={{ margin: 0, color: "#d4d4d4" }}>
                    <code>{highlightSQL(message.sql)}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp — msg-indent: 40px desktop, 8px mobile */}
        <div className="msg-indent">
          <span style={{ fontSize: 11, color: "#c4bfb8" }}>
            {message.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── SQL keyword highlighter ──────────────────────────────────────────────────
function highlightSQL(sql: string): React.ReactNode {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|WITH|AS|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|DISTINCT|TOP|BY|ASC|DESC|LIMIT|OFFSET|UNION|ALL|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|VIEW|DATEPART|DATEADD|DATEDIFF|FORMAT|CAST|CONVERT|GETDATE|YEAR|MONTH|DAY|COALESCE|NULLIF|IIF|NOLOCK)\b/gi;
  const parts = sql.split(keywords);
  const matches = sql.match(keywords) || [];
  return parts.map((part, i) => (
    <span key={i}>
      <span style={{ color: "#d4d4d4" }}>{part}</span>
      {matches[i] && <span style={{ color: "#569cd6", fontWeight: 600 }}>{matches[i]}</span>}
    </span>
  ));
}

// ── Inline markdown: bold + bullet points ────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ fontSize: 14, color: "#2d3436", lineHeight: 1.6 }}>
      {lines.map((line, i) => {
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginTop: i > 0 ? 4 : 0 }}>
              <span style={{ color: "#1a8a8a", marginTop: 1, flexShrink: 0 }}>•</span>
              <span>{renderBold(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
        return <p key={i} style={{ margin: i > 0 ? "4px 0 0" : 0 }}>{renderBold(line)}</p>;
      })}
    </div>
  );
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ fontWeight: 600, color: "#1c1c1c" }}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

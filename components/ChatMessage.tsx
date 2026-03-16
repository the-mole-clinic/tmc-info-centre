"use client";

import { useState } from "react";
import type { Message } from "@/app/page";
import DataTable from "./DataTable";

export default function ChatMessage({ message }: { message: Message }) {
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#1a6b5a] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {/* Avatar + main answer card */}
        <div className="flex items-start gap-3">
          <div className="flex-none w-7 h-7 rounded-full bg-[#e8f4f1] flex items-center justify-center mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex-1">
            <MarkdownText text={message.content} />
          </div>
        </div>

        {/* Data table */}
        {message.tableData && message.tableData.rows.length > 0 && (
          <div className="ml-10">
            <DataTable columns={message.tableData.columns} rows={message.tableData.rows} />
          </div>
        )}

        {/* SQL block */}
        {message.sql && (
          <div className="ml-10">
            <button
              onClick={() => setSqlExpanded(!sqlExpanded)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1a6b5a] transition-colors cursor-pointer"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${sqlExpanded ? "rotate-90" : ""}`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              {sqlExpanded ? "Hide SQL" : "View generated SQL"}
            </button>
            {sqlExpanded && (
              <div className="mt-2 bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-medium">T-SQL</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(message.sql!)}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </button>
                </div>
                <pre className="sql-block text-green-400 px-4 py-3 overflow-x-auto text-xs leading-relaxed">
                  <code>{message.sql}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="ml-10">
          <span className="text-xs text-gray-300">
            {message.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer for bold + bullet points
function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="text-sm text-gray-800 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-[#1a6b5a] mt-0.5">•</span>
              <span>{renderBold(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{renderBold(line)}</p>;
      })}
    </div>
  );
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

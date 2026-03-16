"use client";

import { useState } from "react";

export default function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: unknown[][];
}) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e8e6e1",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      maxWidth: "100%",    /* never wider than the parent column */
      minWidth: 0
    }}>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f3f0", borderBottom: "1px solid #e0ddd8" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left", padding: "9px 14px",
                    color: "#5a5650", fontWeight: 600,
                    whiteSpace: "nowrap", letterSpacing: "0.01em"
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                onMouseEnter={() => setHoveredRow(ri)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  backgroundColor: hoveredRow === ri
                    ? "#f0faf7"
                    : ri % 2 === 0 ? "white" : "#fafaf8",
                  borderBottom: ri < rows.length - 1 ? "1px solid #f0ede8" : "none",
                  transition: "background-color 0.1s ease"
                }}
              >
                {(row as unknown[]).map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "8px 14px",
                      color: ci === 0 ? "#2d2a26" : "#5a5650",
                      fontWeight: ci === 0 ? 500 : 400,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {String(cell ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        padding: "7px 14px",
        borderTop: "1px solid #f0ede8",
        backgroundColor: "#fafaf8",
        display: "flex", alignItems: "center", gap: 6
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b0aa9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        <span style={{ fontSize: 11.5, color: "#b0aa9f" }}>
          {rows.length} row{rows.length !== 1 ? "s" : ""} · {columns.length} columns
        </span>
      </div>
    </div>
  );
}

"use client";

export default function LoadingMessage({ step }: { step: string }) {
  return (
    <div className="msg-appear" style={{ display: "flex", justifyContent: "flex-start" }}>
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

        {/* Loading card */}
        <div style={{
          backgroundColor: "white", borderRadius: "4px 18px 18px 18px",
          padding: "13px 18px",
          border: "1px solid #e8e6e1",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", gap: 12
        }}>
          {/* Bouncing dots */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="loading-dot"
                style={{
                  display: "inline-block",
                  width: 7, height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#1a8a8a",
                  animationDelay: `${i * 0.18}s`
                }}
              />
            ))}
          </div>

          {/* Step text */}
          <span
            key={step}
            className="step-text"
            style={{ fontSize: 13, color: "#7d7971", fontWeight: 500 }}
          >
            {step}
          </span>
        </div>
      </div>
    </div>
  );
}

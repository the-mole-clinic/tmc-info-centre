"use client";

export default function LoadingMessage({ step }: { step: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3">
        <div className="flex-none w-7 h-7 rounded-full bg-[#e8f4f1] flex items-center justify-center mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6b5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#1a6b5a] inline-block" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#1a6b5a] inline-block" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#1a6b5a] inline-block" />
            </div>
            <span className="text-xs text-gray-500 font-medium">{step}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

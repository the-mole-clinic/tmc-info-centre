"use client";

export default function ClinicSelector({
  clinics,
  selected,
  onChange,
}: {
  clinics: string[];
  selected: string;
  onChange: (clinic: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a6b5a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b5a] focus:border-transparent cursor-pointer"
      >
        {clinics.map((clinic) => (
          <option key={clinic} value={clinic}>
            {clinic}
          </option>
        ))}
      </select>
    </div>
  );
}

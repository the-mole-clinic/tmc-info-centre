"use client";

export default function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: unknown[][];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2 text-gray-600 font-semibold whitespace-nowrap"
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
                className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
              >
                {(row as unknown[]).map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 text-gray-700 whitespace-nowrap border-b border-gray-100"
                  >
                    {String(cell ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
        <span className="text-xs text-gray-400">
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

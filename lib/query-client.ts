/**
 * Client-side query pipeline for static/GitHub Pages deployment.
 *
 * Mirrors the logic from app/api/query/route.ts but runs entirely in the
 * browser using mock data. The artificial per-step delays keep the loading
 * animation readable.
 *
 * When deploying to Vercel with real API keys, the API route in
 * app/api/query/route.ts handles the live NL→SQL→Fabric→summarise flow.
 */

import { getMockResult } from "./mock-data";

export type QueryResponse = {
  answer: string;
  sql: string;
  explanation: string;
  tableData?: { columns: string[]; rows: unknown[][] };
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function queryFabric(
  question: string,
  clinic: string | null
): Promise<QueryResponse> {
  // Step 1 — "Interpreting your question..." (~700ms)
  await delay(700);

  // Step 2 — "Generating SQL..." (~800ms)
  await delay(800);

  const mock = getMockResult(question, clinic);

  // Step 3 — "Running against Fabric..." (~700ms)
  await delay(700);

  // Step 4 — "Composing response..." (~500ms)
  await delay(500);

  if (mock) {
    return {
      answer: mock.answer,
      sql: mock.mockSql,
      explanation: `Mock query for: "${question}"`,
      tableData: { columns: mock.columns, rows: mock.rows },
    };
  }

  // No mock match — generic fallback
  return {
    answer:
      "I don't have demo data for that specific query. Try one of the example questions, or connect a real Fabric endpoint for live results.",
    sql: `-- No mock data matched for: "${question}"\n-- Connect FABRIC_SQL_ENDPOINT for live queries.\nSELECT 'Live Fabric connection required' AS message;`,
    explanation: "No mock match found",
    tableData: undefined,
  };
}

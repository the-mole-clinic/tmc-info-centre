/**
 * NL → SQL generation using Claude API.
 * Falls back to mock data when no ANTHROPIC_API_KEY is set.
 */

import { getMockResult } from "./mock-data";
import { SQL_GENERATION_SYSTEM_PROMPT, SUMMARISE_SYSTEM_PROMPT } from "./schema";

export type SQLGenerationResult = {
  sql: string;
  explanation: string;
  isMock: boolean;
};

const IS_MOCK = !process.env.ANTHROPIC_API_KEY;

export async function generateSQL(
  question: string,
  clinic: string | null
): Promise<SQLGenerationResult> {
  // Check for mock match first (works with or without API key in dev)
  const mock = getMockResult(question, clinic);
  if (mock || IS_MOCK) {
    if (mock) {
      return {
        sql: mock.mockSql,
        explanation: `Mock query for: "${question}"`,
        isMock: true,
      };
    }
    // No mock match and no API key — return a placeholder
    return {
      sql: `-- No API key configured and no mock matched\n-- Question: ${question}\nSELECT 'Configure ANTHROPIC_API_KEY to enable live SQL generation' AS message;`,
      explanation: "Mock mode: no matching query found",
      isMock: true,
    };
  }

  return generateSQLWithClaude(question, clinic);
}

async function generateSQLWithClaude(
  question: string,
  clinic: string | null
): Promise<SQLGenerationResult> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = clinic
    ? `Clinic scope: ${clinic}\n\nQuestion: ${question}`
    : `Question: ${question}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SQL_GENERATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Extract JSON from response (Claude may wrap in markdown code blocks)
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse SQL generation response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { sql: string; explanation: string };
  return {
    sql: parsed.sql,
    explanation: parsed.explanation,
    isMock: false,
  };
}

export async function summariseResults(
  question: string,
  sql: string,
  columns: string[],
  rows: unknown[][]
): Promise<string> {
  // Check for mock match
  const mock = getMockResult(question, null);
  if (mock || IS_MOCK) {
    if (mock) return mock.answer;
    if (rows.length === 0) return "No results were returned for your query.";
    return `Found ${rows.length} row${rows.length === 1 ? "" : "s"} of data. Connect your Anthropic API key to get a natural language summary.`;
  }

  return summariseWithClaude(question, sql, columns, rows);
}

async function summariseWithClaude(
  question: string,
  sql: string,
  columns: string[],
  rows: unknown[][]
): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Format table as markdown for the LLM
  const header = columns.join(" | ");
  const divider = columns.map(() => "---").join(" | ");
  const dataRows = rows
    .slice(0, 50) // limit to 50 rows in context
    .map((row) => (row as unknown[]).map((v) => String(v ?? "")).join(" | "))
    .join("\n");

  const tableMarkdown = `| ${header} |\n| ${divider} |\n${dataRows
    .split("\n")
    .map((r) => `| ${r} |`)
    .join("\n")}`;

  const userMessage = `Original question: "${question}"

SQL executed:
\`\`\`sql
${sql}
\`\`\`

Results (${rows.length} rows):
${tableMarkdown}

Please summarise these results in plain English.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SUMMARISE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

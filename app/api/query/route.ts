import { NextRequest, NextResponse } from "next/server";
import { generateSQL } from "@/lib/sql-generator";
import { executeQuery } from "@/lib/fabric";

export async function POST(req: NextRequest) {
  try {
    const { question, clinic } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    // Step 1: Generate T-SQL from natural language
    const { sql, explanation } = await generateSQL(question, clinic ?? null);

    // Step 2: Execute against Fabric silver layer
    const { columns, rows } = await executeQuery(sql);

    // Step 3: Summarise results back to natural language
    const { summariseResults } = await import("@/lib/sql-generator");
    const answer = await summariseResults(question, sql, columns, rows);

    return NextResponse.json({
      answer,
      sql,
      explanation,
      tableData: rows.length > 0 ? { columns, rows } : undefined,
    });
  } catch (err) {
    console.error("[/api/query]", err);
    return NextResponse.json(
      { error: "Internal server error", answer: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

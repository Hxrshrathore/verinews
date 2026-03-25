import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/serpapi";
import { getFactCheckData } from "@/lib/factcheck";
import { analyzeNews } from "@/lib/ai";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { claim } = await req.json();

    if (!claim) {
      return NextResponse.json({ error: "Claim is required" }, { status: 400 });
    }

    // 1. Fetch Search Results
    const searchResults = await searchNews(claim);

    // 2. Fetch Fact Check Data
    const factCheckData = await getFactCheckData(claim);

    // 3. Analyze with Gemini
    const analysis = await analyzeNews({
      claim,
      searchResults,
      factCheckData,
    });

    // 4. Save to Database
    try {
      if (sql) {
        await sql`
          INSERT INTO verifications (claim, verdict, confidence, reason, sources)
          VALUES (${claim}, ${analysis.verdict}, ${analysis.confidence}, ${analysis.reason}, ${JSON.stringify(analysis.sources)})
        `;
      }
    } catch (dbError) {
      console.error("Database Save Error:", dbError);
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!sql) return NextResponse.json([]);
    const history = await sql`SELECT * FROM verifications ORDER BY created_at DESC LIMIT 20`;
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json([]);
  }
}

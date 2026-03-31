import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/serpapi";
import { getFactCheckData } from "@/lib/factcheck";
import { analyzeNews } from "@/lib/ai";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const verifySchema = z.object({
  claim: z.string().min(5, "Claim too short").max(500, "Claim too long"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success, remaining, reset } = rateLimit(ip, 5, 60000);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", reset: new Date(reset).toISOString() },
      { status: 429, headers: { "X-RateLimit-Limit": "5", "X-RateLimit-Remaining": remaining.toString(), "X-RateLimit-Reset": reset.toString() } }
    );
  }

  const body = await req.json();
  const validation = verifySchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
  }

  const { claim } = validation.data;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (status: string, progress: number) => {
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'status', status, progress }) + "\n"));
      };

      try {
        sendStatus("Initializing Verification Matrix...", 10);
        
        // Parallelizing search and fact check for performance
        sendStatus("Harvesting Global Search Data...", 30);
        const [searchResults, factCheckData] = await Promise.all([
          searchNews(claim),
          getFactCheckData(claim)
        ]);

        sendStatus("Scanning Verified Fact-Check Databases...", 60);
        
        sendStatus("Processing Multi-Vector Intelligence...", 85);
        const analysis = await analyzeNews({
          claim,
          searchResults,
          factCheckData,
        });

        // Final normalization and deciveness check
        if (typeof analysis.confidence === 'number') {
          analysis.confidence = analysis.confidence <= 1 
            ? Math.round(analysis.confidence * 100) 
            : Math.round(analysis.confidence);
        }

        // Save to Database in background
        sendStatus("Finalizing Integrity Report...", 95);
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

        sendStatus("Completed", 100);
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: analysis }) + "\n"));
        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', error: error.message }) + "\n"));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
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

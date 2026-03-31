export async function analyzeNews(data: {
  claim: string;
  searchResults: any[];
  factCheckData: any[];
}) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined.");
  }

  const prompt = `
    You are a professional, decisive news verification AI. 
    
    CRITICAL RULE: Your "verdict" MUST logically match your "reason". 
    - If the evidence shows a claim is False or a Hoax, the verdict MUST be "FAKE". 
    - If the evidence supports the claim as true, the verdict MUST be "REAL".
    - If it's a mix or lacks context, use "MISLEADING".
    - Avoid being neutral or biased. Be authoritative based on the provided search data.

    Claim: ${data.claim}
    
    Search Results:
    ${JSON.stringify(data.searchResults.slice(0, 5), null, 2)}
    
    Fact Check Data:
    ${JSON.stringify(data.factCheckData, null, 2)}
    
    Provide your output STRICTLY in the following JSON format without any other text or markdown blocks:
    {
      "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
      "confidence": number (0-100 scale),
      "reason": "Clear, concise architectural analysis of the claim's integrity.",
      "sources": ["URL1", "URL2"]
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "VeriNews AI",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // Defensive check for OpenRouter response structure
    if (!result || !result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
      console.error("Malformed AI Response:", result);
      throw new Error(`AI Model failure: ${JSON.stringify(result.error || "No choices returned from model")}`);
    }

    const text = result.choices[0]?.message?.content || "";
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to extract JSON from AI response: " + text.slice(0, 50) + "...");
  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);
    throw error;
  }
}

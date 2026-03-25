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
    You are a professional fake news detection system.
    
    Analyze the following news claim using the provided web search results and fact-check data.
    
    Claim: ${data.claim}
    
    Search Results:
    ${JSON.stringify(data.searchResults.slice(0, 5), null, 2)}
    
    Fact Check Data:
    ${JSON.stringify(data.factCheckData, null, 2)}
    
    Provide your output STRICTLY in the following JSON format without any other text or markdown blocks:
    {
      "verdict": "REAL", "FAKE", "MISLEADING", or "UNVERIFIED",
      "confidence": number,
      "reason": "explanation",
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
    const text = result.choices[0]?.message?.content || "";
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response: " + text);
  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);
    throw error;
  }
}

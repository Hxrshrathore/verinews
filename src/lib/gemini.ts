import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function analyzeNews(data: {
  claim: string;
  searchResults: any[];
  factCheckData: any[];
}) {
  const prompt = `
    You are a professional fake news detection system.
    
    Analyze the following news claim using the provided web search results and fact-check data.
    
    Claim: ${data.claim}
    
    Search Results:
    ${JSON.stringify(data.searchResults.slice(0, 5), null, 2)}
    
    Fact Check Data:
    ${JSON.stringify(data.factCheckData, null, 2)}
    
    Provide your output STRICTLY in the following JSON format:
    {
      "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
      "confidence": number (0-100),
      "reason": "Clear explanation of why this verdict was reached",
      "sources": ["URL1", "URL2", ...]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse Gemini response: " + text);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error.message);
    throw error;
  }
}

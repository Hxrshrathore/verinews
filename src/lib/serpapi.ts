export async function searchNews(query: string) {
  const apiKey = process.env.SERP_API_KEY || process.env.NEXT_PUBLIC_SERP_API_KEY;
  if (!apiKey) {
    console.warn("SERP_API_KEY is not defined.");
    return [];
  }

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google&num=5`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.organic_results || [];
  } catch (error) {
    console.error("SerpAPI Error:", error);
    return [];
  }
}

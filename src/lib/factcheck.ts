export async function getFactCheckData(query: string) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_API_KEY (Fact Check) is not defined.");
    return [];
  }

  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.claims || [];
  } catch (error) {
    console.error("Fact Check API Error:", error);
    return [];
  }
}

export async function POST(req) {
    try {
      const { medicine } = await req.json();
  
      if (!medicine) {
        return new Response(
          JSON.stringify({ error: "Medicine name is required" }),
          { status: 400 }
        );
      }
  
      const GEMINI_API_KEY = "AIzaSyAmNwK1mscfNky7a37zZQGBqRfpC_1uBH0";
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
      const prompt = `What drugs are present in the medicine ${medicine}? Only list drug names in plain words, comma-separated and also mention the drug name with that, no explanation.;`
  
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };
  
      const geminiRes = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
      const drugs = rawText
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
  
      return new Response(
        JSON.stringify({ medicine, drugs, raw: rawText }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        { status: 500 }
      );
    }
  }
  
  // Optional GET for testing
  export async function GET() {
    return new Response(JSON.stringify({ message: "Use POST to get drug names." }));
  }
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

export async function generatePlayPoster(playName: string, genre: string): Promise<string> {
  const prompt = `A highly detailed, dramatic theatrical poster for a Kannada rural drama (Mela) titled "${playName}". 
  The genre is ${genre}. Style: Vintage Indian theatrical art with bold typography, ornate borders, and dramatic characters. 
  Include elements like a wooden stage, red curtains, and traditional masks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = part.inlineData.data;
        // Firestore has a 1MB limit per document. 
        // 1MB in base64 is roughly 750KB of binary data.
        // We'll use a conservative limit of 700KB for the base64 string itself.
        if (base64.length > 700000) {
          console.warn("Generated poster too large for Firestore, using high-quality theatrical fallback.");
          return `https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1000&auto=format&fit=crop`;
        }
        return `data:image/png;base64,${base64}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Poster generation failed:", error);
    // Fallback to a placeholder or generic poster if generation fails
    return `https://images.unsplash.com/photo-1503095396549-807059018b4e?q=80&w=1000&auto=format&fit=crop`;
  }
}

export async function generateCastBio(actorName: string, role: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, dramatic bio for a rural village drama actor named ${actorName} who plays the role of ${role} in a Kannada Mela. Keep it under 50 words. Focus on their stage presence and fan following.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Bio generation failed:", error);
    return `${actorName} is a veteran performer known for their captivating performance as ${role}.`;
  }
}

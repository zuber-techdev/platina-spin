import { GoogleGenAI } from "@google/genai";
import { Member } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateIcebreakers = async (
  member1: Member,
  member2: Member
): Promise<string> => {
  const client = getClient();
  if (!client) return "Please configure your API Key to generate insights.";

  const prompt = `
    I am facilitating a business networking 1-to-1 meeting between two professionals.
    
    Person A: ${member1.name} (${member1.category} at ${member1.company})
    Person B: ${member2.name} (${member2.category} at ${member2.company})

    Please provide:
    1. 3 engaging icebreaker questions tailored to their specific industries tailored for a professional networking context.
    2. 1 potential synergy or collaboration idea between a ${member1.category} and a ${member2.category}.

    Format the output as a clean HTML string (using tags like <ul>, <li>, <strong>, <p>) suitable for a card display. Do not use markdown syntax like \`\`\`. Keep it concise.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Error generating icebreakers:", error);
    return "Could not generate insights at this time. Please try again later.";
  }
};

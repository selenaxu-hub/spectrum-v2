import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArticleAnalysis } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise summary of the article." },
    biasScore: { type: Type.NUMBER, description: "A number from -10 (Far Left) to 10 (Far Right) representing the political bias." },
    biasCategory: { 
      type: Type.STRING, 
      enum: ["Far Left", "Left Leaning", "Center", "Right Leaning", "Far Right"],
      description: "The category of bias."
    },
    reasoning: { type: Type.STRING, description: "Short explanation of why this bias score was assigned." },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date or approximate timeframe." },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    perspectives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sourceName: { type: Type.STRING, description: "Name of a hypothetical or real alternative source." },
          biasCategory: { type: Type.STRING, description: "The bias of this alternative source." },
          headline: { type: Type.STRING, description: "How this source might title the same event." },
          summary: { type: Type.STRING, description: "A brief summary of this alternative viewpoint." }
        }
      }
    },
    effects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING, description: "The area affected (e.g. Economy, Policy)." },
          immediateEffect: { type: Type.STRING, description: "First-order effect." },
          longTermEffect: { type: Type.STRING, description: "Second-order effect." }
        }
      }
    },
    glossary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING }
        }
      }
    },
    books: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    }
  },
  required: ["summary", "biasScore", "biasCategory", "timeline", "perspectives", "effects", "glossary", "books"]
};

export const analyzeArticle = async (text: string): Promise<ArticleAnalysis> => {
  try {
    const prompt = `
      You are Spectrum, an AI news analyst. 
      Analyze the following news article text. 
      Provide a comprehensive "Nutrition Label" for this content.
      
      Tasks:
      1. Summarize the text.
      2. Detect political bias (-10 to 10 scale).
      3. Construct a timeline of events leading to this news.
      4. Provide alternative perspectives from different sides of the political spectrum (Break the echo chamber).
      5. Analyze first-order (immediate) and second-order (long-term) effects on society/economy.
      6. Define complex terms (Glossary).
      7. Recommend related books for deep learning.

      Article Text:
      "${text.substring(0, 15000)}" 
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a neutral, objective, and highly analytical journalist assistant."
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");

    return JSON.parse(jsonStr) as ArticleAnalysis;

  } catch (error) {
    console.error("Error analyzing article:", error);
    throw error;
  }
};

export const analyzeSpecificEffect = async (text: string, domain: string): Promise<string> => {
  // A secondary query for specific user interests
  try {
    const prompt = `
      Based on the following article summary/context:
      "${text.substring(0, 2000)}..."

      Analyze the specific impact on: "${domain}".
      Provide a concise chain of effects (Logic chain).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || "Could not analyze specific effect.";
  } catch (error) {
    console.error("Error specific effect:", error);
    return "Error generating analysis.";
  }
};

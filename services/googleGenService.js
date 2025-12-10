
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";

export async function getImageBuffer(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is missing or not a string");
    }

    const API_KEY = process.env.GOOGLE_GEN_API_KEY
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const currentPrompt = `
      Photorealistic scene featuring a single flat wall in a modern apartment or house.
      The wall must be seamless, centered, and fully visible.
      Apply the following design on the wall: ${prompt}.

      Absolute requirements:
      - No furniture
      - No floors visible
      - No ceilings visible
      - No windows, doors, frames, curtains
      - No shelves, lamps, outlets, switches
      - No paintings, posters, decorations
      - No objects, silhouettes, or shadows implying any object outside frame
      - The scene should show ONLY the wall texture and lighting
      - Straight-on front view, no perspective corners

      Style notes:
      Hyper-realistic lighting, soft shadows, ultra–high texture detail, clean neutral environment, photorealistic render.
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: currentPrompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      }
    });

    if (!response?.candidates?.length) {
      console.error("AI returned no candidates", response);
      throw new Error("No result was returned by AI");
    }

    const parts = response.candidates[0]?.content?.parts;

    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      console.error("AI returned empty parts", response);
      throw new Error("AI response has no content parts, try again");
    }

    for (const part of parts) {
      if (part.text) {
        console.log("TEXT FROM AI:", part.text);
      }

      if (part.inlineData?.data) {
        const pngBuffer = Buffer.from(part.inlineData.data, "base64");
        const webpBuffer = await sharp(pngBuffer)
          .webp({ quality: 90 }) 
          .toBuffer();

        return webpBuffer;
      }
    }

    throw new Error("Try again");

  } catch (err) {
    console.error("❌ getImage error:", err.message);
    throw err;
  }
}
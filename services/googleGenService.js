
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";

export async function getImageBuffer(payload) {
  const {prompt,generatedImage} = payload
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is missing or not a string");
    }

    const API_KEY = process.env.GOOGLE_GEN_API_KEY
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const preparedPrompt = `
      This is NOT an interior scene.
      This is a wall surface visualization.
      Photorealistic close-up view of a single flat wall surface.
      The wall surface must fill 100% of the image frame edge-to-edge.

      The image must represent the wall itself, not an object placed on a wall.
      The design must be part of the wall surface (paint, mural, texture, material), not a separate object.

      Apply the following wall surface design: ${prompt}.

      Absolute requirements:
      - The wall occupies the entire image
      - No visible room context
      - No furniture
      - No floors
      - No ceilings
      - No corners
      - No windows, doors, frames
      - No paintings, posters, panels, screens, canvases
      - No borders, margins, or background
      - No objects mounted or attached to the wall
      - No shadows from off-frame objects

      Camera & composition:
      - Straight-on orthographic front view
      - No perspective depth
      - Flat frontal composition

      Style notes:
      Ultra photorealistic wall surface, realistic material texture, soft natural lighting, high detail, clean neutral lighting.
    `
    const preparedEditPrompt = `
      You are editing an existing photorealistic image of a flat wall in a modern apartment or house.
      The wall is already present, fully visible, and centered.

      Apply the following changes or design on the wall: ${prompt}.

      Guidelines:
      - Keep the wall as the main focus
      - Maintain photorealistic lighting and texture
      - Minor adjustments to shadows or texture are allowed
      - Do not add furniture, floors, ceilings, windows, doors, shelves, lamps, switches, posters, or any other objects outside the wall
      - Perspective should remain straight-on
      - You can modify colors, patterns, or textures on the wall as per the prompt
      - Small enhancements or improvements to realism are welcome
      - Avoid completely changing the scene layout

      Style notes:
      Hyper-realistic render, soft shadows, ultra–high texture detail, clean neutral environment.
    `;

    let dataPrompt
    if(generatedImage) {
      dataPrompt = [
        { text: preparedEditPrompt },
        {
          inlineData: {
            mimeType: "image/webp",
            data: generatedImage,
          },
        },
      ];
    } else {
      dataPrompt = preparedPrompt
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: dataPrompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: '2K'
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
          .webp({ quality: 100,lossless: true }) 
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
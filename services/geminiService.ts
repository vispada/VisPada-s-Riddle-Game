import { GoogleGenAI, Type } from "@google/genai";
import { Riddle, Theme } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_VISION_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        // Handle ArrayBuffer case if necessary, though it's less common for this flow
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export async function generateRiddles(count: number, theme: Theme): Promise<Riddle[]> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: `Generate ${count} family-friendly riddles about common household or outdoor objects related to the theme of "${theme}". For each riddle, provide the riddle text and a one or two-word answer. The objects should be findable by most people.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: `An array of ${count} riddles.`,
          items: {
            type: Type.OBJECT,
            properties: {
              riddle: {
                type: Type.STRING,
                description: 'The text of the riddle.',
              },
              answer: {
                type: Type.STRING,
                description: 'The answer to the riddle (a common object).',
              },
            },
            required: ["riddle", "answer"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("The AI response for riddles was empty.");
    }
    const riddles = JSON.parse(jsonText.trim());
    return riddles;
  } catch (error) {
    console.error("Error generating riddles:", error);
    throw new Error("Failed to generate riddles. The AI might be busy, please try again.");
  }
}


export async function verifyImage(imageFile: File, objectName: string): Promise<boolean> {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `Analyze this image. Does it clearly show a ${objectName}? Answer with a single word: "YES" or "NO".`
    };

    const response = await ai.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: { parts: [imagePart, textPart] },
    });

    const resultText = response.text;
    if (!resultText) {
      // If the response is empty, assume it's not a match.
      return false;
    }
    return resultText.trim().toUpperCase() === 'YES';

  } catch (error) {
    console.error("Error verifying image:", error);
    throw new Error("Failed to verify the image. The AI might be busy, please try again.");
  }
}

export async function generateHint(riddle: string, answer: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: `The riddle is: "${riddle}". The answer is "${answer}". Provide a very short, one-sentence hint for this riddle. The hint should not give away the answer directly.`,
      config: {
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 20 },
      },
    });

    const hintText = response.text;
    if (!hintText) {
      throw new Error("The AI response for the hint was empty.");
    }
    return hintText.trim();
  } catch (error) {
    console.error("Error generating hint:", error);
    throw new Error("Failed to generate a hint. The AI might be busy, please try again.");
  }
}
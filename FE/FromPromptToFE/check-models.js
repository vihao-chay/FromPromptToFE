import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyAjjHBMeCtCg8DZIlL0pYSLko1_M3_u4Zw";

const ai = new GoogleGenAI({ apiKey });

async function check() {
  try {
    console.log("Fetching models...");
    const response = await ai.models.list();
    
    // Attempt iteration
    try {
        for await (const model of response) {
            console.log("Model:", model.name);
        }
    } catch (iterError) {
        console.log("Iteration failed, checking if it is a plain response w/ models property");
        if (response.models) {
            response.models.forEach(m => console.log("Model:", m.name));
        } else {
             console.log("No 'models' property found. Full response keys:", Object.keys(response));
        }
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

check();

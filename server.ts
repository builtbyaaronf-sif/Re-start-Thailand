import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getFallbackPackage } from "./src/fallbackData.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with named parameter
const apiKey = process.env.GEMINI_API_KEY;
const isLiveGeminiActive = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "";

let ai: GoogleGenAI | null = null;
if (isLiveGeminiActive) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ------------------- API ENDPOINTS -------------------

app.post("/api/suggest-package", async (req, res) => {
  try {
    const answers = req.body;
    
    // Validate inputs
    if (!answers || !answers.experience || !answers.budget || !answers.destination) {
      return res.status(400).json({ error: "Missing questionnaire requirements." });
    }

    // Default or Fallback check
    if (!isLiveGeminiActive || !ai) {
      console.log("No active Gemini API key found. Utilizing local super-curated package suggestions.");
      const fallbackData = getFallbackPackage(answers);
      return res.json({
        source: "curated_fallback",
        data: fallbackData
      });
    }

    // Call live Gemini models for premium content curation
    console.log("Active Gemini key found. Curation of Muay Thai Restart package in progress...");

    const userPrompt = `
      Please curate a highly personalized Muay Thai Restart training package in Thailand based on the following answers:
      - Experience level: ${answers.experience} (beginner: friendly onboarding & basic; intermediate: drills & controlled sparring; advanced: hard pads, clinching & cardio masterclasses)
      - Travel Budget: ${answers.budget} (backpacker: hostel dorms & street eats; midrange: clean private AC resort/bungalow & pool; luxury: high-end villa, saunas, organic eating/juices)
      - Primary Destination Choice: ${answers.destination} (phuket, samui, or combo of both)
      - Comfort Focus Style: ${answers.comfortAccent} (training, wellness, or beach relaxation)
      - Departure City: ${answers.departureCity || 'London'}

      Suggest real prominent physical gyms in Thailand matching their destination:
      - Phuket recommendation: Tiger Muay Thai, Sinbi Muay Thai, Bangtao Muay Thai, Phuket Fight Club, AKA Thailand.
      - Koh Samui recommendation: Yodyut Muay Thai, Superpro Samui, Jun Muay Thai, Lamai Muay Thai, Punch It Gym.

      Ensure accommodations Suggested:
      - Match their budget: Backpacker ($10-$15/night), Mid-range ($30-$70/night), Luxury ($150-$250/night).
      - Specify distance to the gym (e.g. 'On-site', '5 mins walk', '10 mins scooter hire').

      Provide Flight estimates:
      - Real flight prices & routes from ${answers.departureCity} to Phuket (HKT) or Koh Samui (USM) (approx $500-$900 for budget/mid, $1500-$2200 for premium cabins).

      Create a tailored 7-day training schedule/vibe:
      - Day-by-day sequence guiding their spiritual and physical recovery (the Re:start experience).
    `;

    const packageResponseSchema = {
      type: Type.OBJECT,
      properties: {
        recommendationReason: {
          type: Type.STRING,
          description: "A professional and warm introduction explaining why this curated Muay Thai retreat fits their experience level, budget and recovery accent."
        },
        suggestedGyms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              location: { type: Type.STRING, description: "Specific district or street on the island, e.g. Soi Ta-iad, Chalong, Phuket" },
              island: { type: Type.STRING, description: "Must yield exactly either 'Phuket' or 'Koh Samui'" },
              description: { type: Type.STRING, description: "Compelling description of the training environment and energy" },
              trainingFocus: { type: Type.STRING, description: "Striking technique, wrestling, fitness bootcamps, sparring flow, etc." },
              typicalCost: { type: Type.STRING, description: "E.g. '$140 / week'" },
              rating: { type: Type.NUMBER },
              amenities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              whyMatch: { type: Type.STRING, description: "E.g. Patience for beginners, severe sparring partners for pros" },
              coordinates: { type: Type.STRING, description: "Approximate google map format 'latitude, longitude'" },
              schedule: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Typical morning and afternoon hours schedules"
              }
            },
            required: ["id", "name", "location", "island", "description", "trainingFocus", "typicalCost", "rating", "amenities", "whyMatch", "schedule"]
          }
        },
        suggestedAccommodations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING, description: "E.g. Premium Gym Dorm, AC Private Bungalow, Beachfront Sea Resort" },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              costPerNight: { type: Type.INTEGER, description: "Estimated Nightly Cost in USD" },
              comfortLevel: { type: Type.STRING, description: "Must yield exactly either 'Backpacker', 'Mid-range', or 'Luxury'" },
              distanceToGym: { type: Type.STRING, description: "e.g. 'On-site', '2 mins walk'" },
              whyMatch: { type: Type.STRING },
              features: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "name", "type", "location", "description", "costPerNight", "comfortLevel", "distanceToGym", "whyMatch", "features"]
          }
        },
        suggestedFlights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              airline: { type: Type.STRING },
              departureCity: { type: Type.STRING },
              destinationCity: { type: Type.STRING },
              duration: { type: Type.STRING },
              averagePriceUsd: { type: Type.INTEGER },
              connections: { type: Type.STRING, description: "E.g. Direct, 1-stop via Bangkok or Doha" },
              seasonalNote: { type: Type.STRING }
            },
            required: ["id", "airline", "departureCity", "destinationCity", "duration", "averagePriceUsd", "connections", "seasonalNote"]
          }
        },
        itinerary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayNum: { type: Type.INTEGER },
              title: { type: Type.STRING },
              morning: { type: Type.STRING },
              afternoon: { type: Type.STRING },
              evening: { type: Type.STRING },
              tips: { type: Type.STRING }
            },
            required: ["dayNum", "title", "morning", "afternoon", "evening", "tips"]
          }
        },
        costSummary: {
          type: Type.OBJECT,
          properties: {
            gymWeeklyCost: { type: Type.INTEGER, description: "Estimated average weekly training price" },
            accommodationNightlyCost: { type: Type.INTEGER },
            flightCost: { type: Type.INTEGER },
            scooterAndFoodWeeklyCost: { type: Type.INTEGER, description: "Estimated spending on scoot lease and hydration meals" },
            totalEstimatedCost: { type: Type.INTEGER, description: "Aggregate math of flight + (accomNightly * 7) + gymWeekly + scooterAndFood" },
            savingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["gymWeeklyCost", "accommodationNightlyCost", "flightCost", "scooterAndFoodWeeklyCost", "totalEstimatedCost", "savingTips"]
        }
      },
      required: ["recommendationReason", "suggestedGyms", "suggestedAccommodations", "suggestedFlights", "itinerary", "costSummary"]
    };

    let response;
    let modelUsed = "gemini-3.5-flash";
    try {
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: packageResponseSchema,
          systemInstruction: "You are an elite travel concierge specializing in martial arts fitness retreats to Phuket & Koh Samui, Thailand. Your goal is to guide restarting individuals physically and spiritually. Only respond in pristine JSON matching the schema."
        }
      });
    } catch (firstError: any) {
      console.warn("Primary model gemini-3.5-flash experienced an issue or high demand. Retrying with highly-available gemini-3.1-flash-lite model...", firstError.message || firstError);
      modelUsed = "gemini-3.1-flash-lite";
      response = await ai.models.generateContent({
        model: modelUsed,
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: packageResponseSchema,
          systemInstruction: "You are an elite travel concierge specializing in martial arts fitness retreats to Phuket & Koh Samui, Thailand. Your goal is to guide restarting individuals physically and spiritually. Only respond in pristine JSON matching the schema."
        }
      });
    }

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({
      source: "gemini_ai",
      model: modelUsed,
      data: parsedJson
    });

  } catch (error: any) {
    console.error("Gemini suggestion failure:", error);
    // Gracefully handle to ensure clean experience
    const fallbackData = getFallbackPackage(req.body);
    return res.json({
      source: "recovered_fallback_after_error",
      data: fallbackData,
      debugMessage: error.message
    });
  }
});


// ------------------- FRAMEWORK MIDDLEWARES -------------------

async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Re:start Thailand Server operating safely on http://0.0.0.0:${PORT}`);
  });
}

configureServer();

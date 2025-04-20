require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenAI, Modality } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5001;

// --- Configure Gemini ---
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY not found in .env. AI features will not work."
  );
}
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Helper: parse data URL
function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return { mimeType: match[1], base64: match[2] };
}

async function extractImageData(imageUrl) {
  if (imageUrl.startsWith("data:")) {
    const { mimeType, base64 } = parseDataUrl(imageUrl);
    return { contentType: mimeType, base64Image: base64 };
  }
  // remote URL
  const fetchRes = await fetch(imageUrl);
  const contentType = fetchRes.headers.get("content-type") || "image/png";
  const arrayBuffer = await fetchRes.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  return { contentType, base64Image };
}

// Basic health check
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to AI UI Critic API!" });
});

// User Journey Analysis
app.post("/api/analyze/journey", async (req, res) => {
  const { imageUrl } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI Service Unavailable: API Key not configured." });
  }
  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL is required for analysis." });
  }

  try {
    const { contentType, base64Image } = await extractImageData(imageUrl);
    const prompt = `
      Analyze the user interface shown in the image provided.
      Imagine a typical user trying to achieve a common goal (e.g., sign up, find info).
      Describe:
      1. Clarity of CTA and navigation
      2. Potential confusion
      3. Friction points
      4. 1-2 improvement suggestions
      Keep it concise and actionable.
    `;
    const parts = [
      { inlineData: { mimeType: contentType, data: base64Image } },
      { text: prompt }
    ];
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: parts,
    });
    if (!result.text) throw new Error("No content received from Gemini.");
    res.json({ journeyAnalysis: result.text });
  } catch (err) {
    console.error("Gemini journey analysis error:", err);
    res.status(err.response?.status || 500).json({
      message: err.response?.data?.message || err.message || "Failed journey analysis."
    });
  }
});

// A/B Test Suggestions
app.post("/api/generate/abtest", async (req, res) => {
  const { imageUrl } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI Service Unavailable: API Key not configured." });
  }
  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL is required." });
  }

  try {
    const { contentType, base64Image } = await extractImageData(imageUrl);
    const prompt = `
      Analyze the UI screenshot.
      Focus on CTA buttons or headlines.
      Suggest 1-2 alternative text variations for A/B testing for one prominent element.
      Include original text (if visible), variations, and rationale.
      Format clearly (e.g., markdown).
    `;
    const parts = [
      { inlineData: { mimeType: contentType, data: base64Image } },
      { text: prompt }
    ];
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: parts,
    });
    if (!result.text) throw new Error("No content received for A/B test.");
    res.json({ abTestSuggestions: result.text });
  } catch (err) {
    console.error("Gemini A/B test error:", err);
    res.status(err.response?.status || 500).json({
      message: err.response?.data?.message || err.message || "Failed to generate A/B suggestions."
    });
  }
});

// Variant Image Generation via Gemini Vision
app.post("/api/generate/variant-image", async (req, res) => {
  const { imageUrl } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI Service Unavailable: API Key not configured." });
  }
  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL is required." });
  }

  try {
    const { contentType, base64Image } = await extractImageData(imageUrl);
    const prompt = `
      You are an expert UX designer. Given this UI screenshot, generate a variant that:
      1. Improves contrast
      2. Emphasizes the main CTA
      3. Simplifies layout for clarity
      Return only the image as base64-encoded ${contentType}, without extra text.
    `;
    const parts = [
      { inlineData: { mimeType: contentType, data: base64Image } },
      { text: prompt }
    ];
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: parts,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] }
    });
    const candidate = result.candidates?.[0]?.content?.parts;
    const imagePart = candidate?.find(p => p.inlineData);
    if (!imagePart) throw new Error("No image data from Gemini variant.");
    const dataUrl = `data:${contentType};base64,${imagePart.inlineData.data}`;
    res.json({ variantImageUrl: dataUrl });
  } catch (err) {
    console.error("Gemini variant-image error:", err);
    res.status(err.response?.status || 500).json({
      message: err.response?.data?.message || err.message || "Failed to generate variant image."
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

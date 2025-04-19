// server/server.js
require("dotenv").config(); // Load environment variables first
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("./config/cloudinary"); // Import configured Cloudinary instance
const path = require("path"); // Needed if storing temporarily
const { OpenAI } = require("openai");

const app = express();
const PORT = process.env.PORT || 5001;
// --- Configure OpenAI ---
// Ensure API key is loaded from .env
if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY not found in .env. AI features will not work.");
}
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors()); // Allow requests from your frontend origin
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies, increase limit for images if needed
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// Multer Configuration (store in memory first)
const storage = multer.memoryStorage(); // Store file in buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    );
  },
});

// Basic Route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to AI UI Critic API!" });
});

// Image Upload Route
app.post("/api/upload", upload.single("designImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Upload image buffer to Cloudinary
    // Convert buffer to data URI for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "ai-ui-critic-uploads", // Optional: Organize in Cloudinary
      // public_id: `design_${Date.now()}`, // Optional: Custom public ID
      // resource_type: 'image' // Default is image
    });

    console.log("Cloudinary Upload Result:", result);

    // In a real app, you'd save `result.secure_url` and `result.public_id`
    // to your database associated with a user or analysis ID.
    // For now, just return the URL.

    res.status(201).json({
      message: "File uploaded successfully!",
      imageUrl: result.secure_url,
      publicId: result.public_id, // Important for potential deletion/updates
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    // Check if it's a file filter error
    if (error.message.startsWith("Error: File upload only supports")) {
      return res.status(400).json({ message: error.message });
    }
    // Check if it's a Cloudinary error (might need more specific checks)
    if (error.http_code) {
      return res
        .status(error.http_code)
        .json({ message: error.message || "Cloudinary upload failed." });
    }
    res.status(500).json({ message: "Server error during upload." });
  }
});

// --- Route for User Journey Analysis ---
// POST because we might send image URL and context
app.post('/api/analyze/journey', async (req, res) => {
  const { imageUrl, analysisId, context } = req.body; // Get image URL and maybe context/ID

  if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ message: "AI Service Unavailable: API Key not configured." });
  }

  if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required for analysis.' });
  }

  try {
      console.log(`Analyzing journey for image: ${imageUrl}`);
      // --- Prepare Prompt for GPT-4 Vision (or text if only URL) ---
      // GPT-4 Vision can directly analyze images if you pass the URL.
      // Or, you could describe the image if using a text-only model.

      const prompt = `
          Analyze the user interface shown in the image provided.
          Imagine a typical user trying to achieve a common goal related to this UI (e.g., sign up, find information, complete a task).
          Describe a potential user journey, highlighting:
          1.  Clarity: Is the main call to action clear? Is navigation intuitive?
          2.  Potential Confusion: Are there any ambiguous labels, confusing icons, or potentially misleading elements?
          3.  Friction Points: Could any steps be frustrating or cause users to abandon the task?
          4.  Suggestions: Briefly suggest 1-2 improvements for flow or clarity.
          Keep the analysis concise and actionable. Focus on the primary flow visible in the screenshot.
          `;

      // --- Make API Call to OpenAI ---
      // Using GPT-4 Vision Preview model (check latest model names)
       const model = "omni-moderation-latest"; // Or "gpt-4-turbo" if sending description instead of image URL
      // const model = "gpt-3.5-turbo"; // Cheaper text-only option if describing the image

      const response = await openai.chat.completions.create({
          model: model,
          messages: [
              {
                  role: "user",
                  content: [
                      { type: "text", text: prompt },
                      {
                          type: "image_url",
                          image_url: {
                              "url": imageUrl,
                              "detail": "low" // Use "low" fidelity for cheaper/faster analysis unless high detail needed
                          },
                      },
                  ],
              },
          ],
          max_tokens: 400, // Adjust token limit as needed
          // temperature: 0.3 // Lower temperature for more focused output
      });

      console.log("OpenAI API Response:", response);

      const analysisResult = response.choices[0]?.message?.content;

      if (!analysisResult) {
          throw new Error("No content received from OpenAI.");
      }

      // TODO: Save analysisResult to your database associated with analysisId

      res.json({ journeyAnalysis: analysisResult });

  } catch (error) {
      console.error('Error calling OpenAI API:', error);
      let statusCode = 500;
      let message = 'Failed to perform journey analysis.';
      if (error.response) { // Check for OpenAI specific errors
          console.error('OpenAI Error Status:', error.response.status);
          console.error('OpenAI Error Data:', error.response.data);
          statusCode = error.response.status;
          message = error.response.data?.error?.message || message;
      } else if (error.message === "AI Service Unavailable: API Key not configured.") {
          statusCode = 503;
          message = error.message;
      }
       else if (error.message === "No content received from OpenAI.") {
          statusCode = 502; // Bad Gateway (didn't get expected response)
          message = error.message;
      }
      res.status(statusCode).json({ message: message });
  }
});

// --- Route for A/B Test Suggestions ---
app.post('/api/generate/abtest', async (req, res) => {
  const { imageUrl, analysisId, elementType, elementDescription } = req.body; // e.g., elementType: 'button', elementDescription: 'Sign Up Button'

  if (!process.env.OPENAI_API_KEY) {
       return res.status(503).json({ message: "AI Service Unavailable: API Key not configured." });
  }

  if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required.' });
  }
   // Optional: Could require element type/description for focused suggestions
  // if (!elementType || !elementDescription) {
  //     return res.status(400).json({ message: 'Element type and description are required for A/B testing.' });
  // }

  try {
      console.log(`Generating A/B test for image: ${imageUrl}`);

      // --- Prepare Prompt ---
      // Make the prompt specific. You might want to ask for button text, headline variations, etc.
      const prompt = `
          Analyze the user interface shown in the image.
          Focus on key call-to-action buttons or primary headlines visible.
          Suggest 1-2 alternative text variations (copy) for A/B testing for ONE prominent element (like a button or headline).
          Clearly state the original text (if discernible) and the suggested variations.
          Explain briefly why these variations might perform better (e.g., clearer value proposition, stronger verb, urgency).
          Format the output clearly, perhaps using markdown.

          Example Target Element (if provided): ${elementType || 'Primary Button/Headline'}
          Example Description (if provided): ${elementDescription || 'N/A'}
      `;

      // --- Make API Call to OpenAI ---
      // Using GPT-4 Vision Preview model
       const model = "gpt-4-vision-preview"; // Or text model like "gpt-4-turbo" or "gpt-3.5-turbo"

       const response = await openai.chat.completions.create({
          model: model,
          messages: [
              {
                  role: "user",
                  content: [
                      { type: "text", text: prompt },
                      {
                          type: "image_url",
                          image_url: {
                              "url": imageUrl,
                              "detail": "low"
                          },
                      },
                  ],
              },
          ],
          max_tokens: 300, // Adjust token limit
          // temperature: 0.5 // Slightly higher temp for more creative suggestions
      });

      const analysisResult = response.choices[0]?.message?.content;

       if (!analysisResult) {
          throw new Error("No content received from OpenAI for A/B test.");
      }

      // TODO: Save result to DB

      res.json({ abTestSuggestions: analysisResult });

  } catch (error) {
       console.error('Error calling OpenAI API for A/B test:', error);
      let statusCode = 500;
      let message = 'Failed to generate A/B test suggestions.';
      if (error.response) {
          statusCode = error.response.status;
          message = error.response.data?.error?.message || message;
      } else if (error.message === "AI Service Unavailable: API Key not configured.") {
          statusCode = 503;
          message = error.message;
      }
       else if (error.message.startsWith("No content received")) {
          statusCode = 502;
          message = error.message;
      }
      res.status(statusCode).json({ message: message });
  }
})
// Placeholder for future API routes
// app.post('/api/analyze/contrast', ...)
// app.post('/api/analyze/journey', ...)
// app.post('/api/generate/abtest', ...)
// app.post('/api/upload', ...) // We might handle upload differently

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

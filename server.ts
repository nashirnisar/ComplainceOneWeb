import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getAIInstance(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// AI Compliance Assistant Chat Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, userProfile, tasks } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array provided." });
      return;
    }

    const ai = getAIInstance();

    // Reconstruct the chat context from the client
    const systemInstruction = `You are ComplianceOne AI, a professional and highly knowledgeable regulatory and compliance assistant.
Your goal is to help individuals, freelancers, startups, and small businesses understand their compliance filing schedules, tax deadlines, penalty risks, and statutory guides.

CRITICAL INSTRUCTION FOR CONCISENESS:
- You MUST provide extremely concise, high-level responses instead of detailed or lengthy explanations.
- Responses MUST focus strictly on key points and actionable insights only.
- Do NOT write long paragraphs. Keep explanations brief, concise and direct.

USER PROFILE CONTEXT:
- Name: ${userProfile?.personalInfo?.name || "Not provided"}
- Role: ${userProfile?.userType || "Not configured"}
- Info: ${userProfile?.businessInfo ? JSON.stringify(userProfile.businessInfo) : "Not set"}

ACTIVE COMPLIANCE DEADLINES:
${Array.isArray(tasks) ? tasks.map((t: any) => `- [${t.status}] ${t.name} (Due: ${t.dueDate}, Priority: ${t.priority}, Category: ${t.category}). Penalty: ${t.penalty}`).join("\n") : "None loaded."}

GUIDELINES:
1. Base replies on actual timelines and structure answers as extremely concise markdown lists/bullets with bold highlights.
2. Focus on action items.
`;

    // Map conversation except the last user message which will be passed to generateContent
    const lastUserMessage = messages[messages.length - 1]?.content;
    const history = messages.slice(0, messages.length - 1).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // We can use ai.models.generateContent or use chat session. Let's usegenerateContent with the full conversation history as content parts or context.
    // Construct request contents
    const contents: any[] = [];
    
    // Add history
    history.forEach((h: any) => {
      contents.push({
        role: h.role,
        parts: h.parts
      });
    });

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: lastUserMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const outputText = response.text || "I was unable to formulate a compliance response. Please re-phrase your request.";
    res.json({ content: outputText });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while communicating with the compliance engine." 
    });
  }
});

// Server Health Route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Configure Vite or Static Asset File Serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server integration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ComplianceOne] Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to bootstrap server container:", err);
});

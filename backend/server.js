import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { CohereClient } from 'cohere-ai';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule.default;

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Cohere
const apiKey = process.env.COHERE_API_KEY;
const isPlaceholder = !apiKey || apiKey.length < 20 || apiKey.includes('YOUR_KEY');

if (isPlaceholder) {
    console.warn(">>> NOTICE: No valid COHERE_API_KEY found in .env. The app relies on it!");
}

const cohere = new CohereClient({ token: apiKey || "MOCK_KEY" });

// Helper function for AI generation with retries
async function generateWithRetry(contents, model = 'command-nightly', maxRetries = 2) {
    let promptText = "";
    if (typeof contents === "string") {
        promptText = contents;
    } else if (Array.isArray(contents)) {
        promptText = contents.map(c => typeof c === 'string' ? c : JSON.stringify(c)).join("\n");
    }

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const result = await cohere.chat({
                model: model,
                message: promptText,
                temperature: 0.3
            });
            return result.text;
        } catch (error) {
            const errorMsg = error.message || "";
            const isQuotaError = errorMsg.includes("429") || error.status === 429;
            
            if (isQuotaError && i < maxRetries) {
                const waitSecs = 5;
                console.log(`!!! Rate limited. Waiting ${waitSecs}s... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitSecs * 1000));
                continue;
            }
            throw error;
        }
    }
}

// Mockup Quiz Data for Demo Mode
const getMockupQuiz = (topic) => [
    {
        question: `What is a fundamental concept often discussed in ${topic || 'this subject'}?`,
        options: ["Option Alpha", "Option Beta", "Option Gamma", "Option Delta"],
        correctIndex: 1,
        explanation: "Option Beta is the correct answer because it represents the standard baseline in this context."
    },
    {
        question: `Which of these is most relevant to ${topic || 'the material'}?`,
        options: ["Consistency", "Scalability", "Reliability", "All of the above"],
        correctIndex: 3,
        explanation: "In modern studies, all three factors—Consistency, Scalability, and Reliability—are considered equally vital."
    },
    {
        question: "Who is considered a pioneer in this field?",
        options: ["Isaac Newton", "Ada Lovelace", "Albert Einstein", "Marie Curie"],
        correctIndex: 1,
        explanation: "Ada Lovelace is widely recognized as the first computer programmer for her work on the Analytical Engine."
    }
];

// In-memory store (simplified for demo)
let userStore = {
    xp: 1240, 
    chatHistory: []
};

// --- API: Explain Topic (From previous work) ---
app.post('/api/explain', async (req, res) => {
    try {
        const { message, topic, level } = req.body;
        const prompt = `You are StudyBuddy AI, an expert tutor. Topic: ${topic}, Level: ${level}. 
        User asks: ${message}. 
        
        You MUST provide a structured JSON response with exactly these fields:
        {
          "steps": ["Step 1 of brief explanation", "Step 2", "Step 3..."],
          "keyConcept": "A single sentence stating the core academic concept here.",
          "example": "A concrete example showing exactly how this works or a sample problem fully solved."
        }
        Do NOT put an example in the keyConcept. Do NOT put the explanation in the keyConcept.`;

        const resultText = await generateWithRetry(prompt, 'command-nightly');
        
        // Clean possible markdown backticks
        const cleanJson = resultText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        userStore.xp += 5;
        res.json({ success: true, updated_xp: userStore.xp, response: parsed });
    } catch (error) {
        console.warn("!!! Cohere Chat Error:", error.message || error);
        
        // Fallback to Error Response
        const errorResponse = {
            steps: [
                "I encountered an error connecting to the AI service.",
                "This could be due to a rate limit or an invalid API key.",
                "Please check the terminal logs for more details."
            ],
            example: "",
            keyConcept: "API Connection Error"
        };
        
        userStore.xp += 0;
        res.json({ success: false, updated_xp: userStore.xp, response: errorResponse, isDemo: false });
    }
});

// --- API: Generate Quiz ---
app.post('/api/generate-quiz', upload.single('file'), async (req, res) => {
    const { topic, numQuestions, timeLimit, difficulty } = req.body;
    
    try {
        let context = topic || "General knowledge";
        let extractedText = "";

        if (req.file) {
            // Extract text from uploaded document for Cohere
            try {
                if (req.file.mimetype === 'application/pdf') {
                    const parsed = await pdfParse(req.file.buffer);
                    extractedText = parsed.text;
                } else {
                    // Assume text-like fallback
                    extractedText = req.file.buffer.toString('utf-8');
                }
                
                // Limit the text to avoid context token limits, command-r handles 128k but let's be safe
                const limitedText = extractedText.substring(0, 25000); 
                context = `the following extracted document text: \n\n"""\n${limitedText}\n"""\n\n`;
            } catch (err) {
                console.error("PDF Parsing error:", err);
                throw new Error("Could not parse the uploaded document.");
            }
        }

        const prompt = `Generate a ${difficulty || 'Medium'} difficulty quiz with ${numQuestions || 10} multiple choice questions based on ${context}.
        The quiz should take approximately ${timeLimit || 10} minutes.
        Return ONLY a JSON array of objects. Each object MUST have:
        "question": string (concise),
        "options": ["A", "B", "C", "D"],
        "correctIndex": number (0-3),
        "explanation": string (brief, max 20 words)
        
        Strict JSON only, no markdown.`;

        const contents = prompt;
        
        console.log(`Generating fast quiz for topics/context: ${context}...`);
        
        const resultText = await generateWithRetry(prompt, 'command-nightly');
        
        const cleanJson = resultText.replace(/```json|```/g, "").trim();
        const quizData = JSON.parse(cleanJson);

        res.json({
            success: true,
            quiz: quizData
        });

    } catch (error) {
        console.warn("!!! Cohere API Error:", error.message || error);
        
        // Return Error, do not fallback to mock data
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate quiz. " + (error.message || "Please check your API key or quota limit.")
        });
    }
});

app.listen(port, () => {
    console.log(`StudyBuddy Backend running at http://localhost:${port}`);
});

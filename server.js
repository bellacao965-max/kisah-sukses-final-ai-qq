import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Groq from "groq-sdk";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

// SERVE PUBLIC FOLDER — WAJIB ADA!
app.use(express.static(path.join(__dirname, "public")));

console.log("Serving static from:", path.join(__dirname, "public"));

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

// ===== AI CORE =====
async function callAI(prompt, model) {
  if (OPENAI_KEY) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const j = await r.json();
    return j.choices?.[0]?.message?.content || "No reply";
  }

  if (GROQ_KEY) {
    const client = new Groq({ apiKey: GROQ_KEY });

    const chat = await client.chat.completions.create({
      model: model || "gemma2-9b-it",
      messages: [{ role: "user", content: prompt }]
    });

    return chat.choices?.[0]?.message?.content || "No reply";
  }

  return "AI key tidak ditemukan.";
}

// ===== API ROUTES =====
app.post("/api/ai", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const reply = await callAI(prompt, model);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI Error", detail: err.message });
  }
});

const QUOTES = [
  "Jangan menyerah. Proses tidak mengkhianati hasil.",
  "Sukses dimulai ketika kamu berani melangkah.",
  "Kerja keras + fokus = hasil nyata."
];

app.get("/api/quote", (req, res) => {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  res.json({ quote: q });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER RUNNING ON PORT", PORT));

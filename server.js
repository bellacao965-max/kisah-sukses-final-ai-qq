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
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

// Serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));
console.log("Serving static from:", path.join(__dirname, "public"));

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

async function callAI(prompt, model){
  if (OPENAI_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: model || "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 600 })
    });
    const j = await res.json();
    return j.choices?.[0]?.message?.content || "No reply";
  }
  if (GROQ_KEY) {
    try {
      const client = new Groq({ apiKey: GROQ_KEY });
      const chat = await client.chat.completions.create({ model: model || "gemma2-9b-it", messages: [{ role: "user", content: prompt }], max_tokens: 600 });
      return chat.choices?.[0]?.message?.content || "No reply";
    } catch (e) {
      console.warn("GROQ sdk call error:", e.message || e);
    }
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: model || "gemma2-9b-it", messages: [{ role: "user", content: prompt }], max_tokens: 600 })
    });
    const jd = await resp.json();
    return jd.choices?.[0]?.message?.content || "No reply";
  }
  return "AI key not configured.";
}

app.post("/api/ai", async (req, res) => {
  try{
    const { prompt, model } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    const reply = await callAI(prompt, model);
    res.json({ reply });
  }catch(e){
    res.status(500).json({ error: "AI Error", detail: String(e) });
  }
});

const QUOTES = [
  "Jangan menyerah. Proses tidak mengkhianati hasil.",
  "Sukses dimulai ketika kamu berani melangkah.",
  "Kerja keras + fokus = hasil nyata."
];

app.get("/api/quote", (req, res) => {
  res.json({ quote: QUOTES[Math.floor(Math.random()*QUOTES.length)] });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER RUNNING ON PORT", PORT));

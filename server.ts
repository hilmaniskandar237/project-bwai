import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase parsing limit to allow larger base64 uploads (like PDFs)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google SDK
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Kunci API Gemini tidak ditemukan. Silakan konfigurasi GEMINI_API_KEY di Settings > Secrets."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Summarize Endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const ai = getAiClient();

    let contents: any[] = [];

    if (fileBase64 && mimeType) {
      // Remove data:image/...;base64, prefix if exist
      const rawBase64 = fileBase64.includes(";base64,")
        ? fileBase64.split(";base64,")[1]
        : fileBase64;

      contents = [
        {
          inlineData: {
            data: rawBase64,
            mimeType: mimeType,
          },
        },
        "Tolong buat ringkasan terstruktur dari dokumen ini menggunakan Bahasa Indonesia.",
      ];
    } else if (text) {
      contents = [
        `Materi:\n\n${text}\n\nTolong buat ringkasan terstruktur dari materi ini menggunakan Bahasa Indonesia.`,
      ];
    } else {
      return res.status(400).json({ error: "Input teks atau file harus disertakan." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction:
          "Anda adalah seorang Software Architect dan Pakar IT Senior yang membantu siswa belajar secara efektif. Buatlah ringkasan dokumen yang ringkas, berbobot, terstruktur dengan baik, serta mudah dipahami secara visual dalam Bahasa Indonesia.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Judul materi atau bab pembelajaran utama",
            },
            summary: {
              type: Type.STRING,
              description: "Ringkasan konsep umum dalam 2-3 paragraf padat",
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Poin-poin konsep kunci terpenting (minimal 5 poin)",
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Rencana tindakan belajar atau topik lanjutan untuk eksplorasi lebih dalam",
            },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Pertanyaan kritis seputar materi" },
                  answer: { type: Type.STRING, description: "Jawaban mendalam berbasis teks" },
                },
                required: ["question", "answer"],
              },
              description: "Daftar 3-5 tanya jawab (QA) pemahaman materi paling relevan",
            },
          },
          required: ["title", "summary", "keyPoints", "actionItems", "faqs"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal menerima respons teks dari AI.");
    }

    const summaryData = JSON.parse(resultText);
    res.json(summaryData);
  } catch (error: any) {
    console.error("Error in /api/summarize:", error);
    res.status(500).json({
      error: error.message || "Terjadi kesalahan internal ketika memproses ringkasan.",
    });
  }
});

// 2. Generate Mindmap Endpoint
app.post("/api/mindmap", async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const ai = getAiClient();

    let contents: any[] = [];
    const promptMessage = `Ubah materi ini menjadi sebuah peta konsep (mindmap) terstruktur yang mendalam dengan Bahasa Indonesia. Peta konsep harus memetakan Topik Utama -> Beberapa Sub-topik Utama -> Detail konsep atau fakta konkret di dalam sub-topik tersebut. Buatlah minimal 4 sub-topik yang informatif.`;

    if (fileBase64 && mimeType) {
      const rawBase64 = fileBase64.includes(";base64,")
        ? fileBase64.split(";base64,")[1]
        : fileBase64;

      contents = [
        {
          inlineData: {
            data: rawBase64,
            mimeType: mimeType,
          },
        },
        promptMessage,
      ];
    } else if (text) {
      contents = [
        `Materi:\n\n${text}\n\n${promptMessage}`,
      ];
    } else {
      return res.status(400).json({ error: "Input teks atau file harus disertakan." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction:
          "Anda adalah seorang Software Architect senior dan Education Engineer. Tugas Anda adalah menguraikan materi pelajaran atau makalah menjadi peta konsep hierarkis terstruktur secara logis menggunakan Bahasa Indonesia. Hasilkan output JSON murni yang mewakili peta konsep tersebut.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: "Topik atau konsep sentral utama dari bacaan",
            },
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Judul sub-topik pendukung (misalnya bab, fitur penting, kategori, atau pilar)",
                  },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Butir-butir detail, fakta kunci, cuplikan kode penting, definisi, atau penjelasan singkat",
                  },
                },
                required: ["title", "points"],
              },
              description: "Daftar sub-topik pendukung yang membagi konsep utama secara logis",
            },
          },
          required: ["topic", "subtopics"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal menerima respons peta konsep dari AI.");
    }

    const mindmapData = JSON.parse(resultText);
    res.json(mindmapData);
  } catch (error: any) {
    console.error("Error in /api/mindmap:", error);
    res.status(500).json({
      error: error.message || "Terjadi kesalahan internal ketika memproses peta konsep.",
    });
  }
});

// Vite & Static file Serving integration
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // In production mode, serve compiled files from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving loaded.");
  }
}

// Start Server
setupViteOrStatic().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
});

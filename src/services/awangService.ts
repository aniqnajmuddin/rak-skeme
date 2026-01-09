import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AWANG SKEME SERVICE - VERSION 2.7 (ULTIMATE REPAIR)
 * Model: Gemini 3 Flash Preview
 */

const MODEL_NAME = "gemini-3-flash-preview"; 

const getApiKey = (): string => {
  const meta = import.meta as any;
  
  // 1. Cuba cara biasa Vite
  let key = meta.env?.VITE_GEMINI_API_KEY;
  
  // 2. Kalau tak jumpa, ambil dari "Suntikan Rahsia" vite.config
  if (!key) {
    key = (window as any).__GEMINI_KEY__;
  }
  
  // --- CCTV DEBUG ---
  console.log("%c--- 🕵️‍♂️ AWANG FINAL REPORT ---", "color: #f59e0b; font-weight: bold;");
  console.log("Kunci Dikesan?", key ? "✅ YA" : "❌ TIDAK");
  if (key) console.log("Panjang Kunci:", key.length, "aksara");
  console.log("%c---------------------------", "color: #f59e0b; font-weight: bold;");
  
  return key || "";
};

const API_KEY = getApiKey();

const REPORT_INSTRUCTION = `Anda AI pakar laporan koku SK Menerong. Guna BM Baku Profesional.`;
const CHAT_INSTRUCTION = `Anda Awang SKeMe, AI SK Menerong. Cakap Loghat Terengganu (Boh, Kite, Bereh).`;

export class AwangService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (API_KEY && API_KEY.length > 10) {
      try {
        this.genAI = new GoogleGenerativeAI(API_KEY);
      } catch (err) {
        console.error("Gagal init AI:", err);
      }
    }
  }

  async *askEinsteinStream(prompt: string): AsyncGenerator<string, void, unknown> {
    if (!this.genAI) {
      yield "Alamak bohh! Kunci API still tak lekat. \n\nCuba: \n1. Rename folder (buang kurungan).\n2. Cek .env jangan ada space.";
      return;
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: CHAT_INSTRUCTION });
      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
      }
    } catch (e: any) { yield `\n[RALAT]: ${e.message}`; }
  }

  async suggestTitle(unit: string, kaliKe: string): Promise<string> {
    if (!this.genAI) return "Aktiviti Mingguan";
    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: REPORT_INSTRUCTION });
      const result = await model.generateContent(`Tajuk pendek koku unit ${unit} kali ke-${kaliKe}.`);
      return result.response.text().replace(/"/g, '').trim();
    } catch (e) { return "Aktiviti Mingguan"; }
  }

  async *generateReportSegment(title: string, unit: string, type: string): AsyncGenerator<string, void, unknown> {
    if (!this.genAI) { yield "API Error"; return; }
    try {
      const model = this.genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: REPORT_INSTRUCTION });
      const result = await model.generateContentStream(`Berikan ${type} untuk aktiviti ${title} unit ${unit}.`);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
      }
    } catch (e: any) { yield `\n[RALAT]: ${e.message}`; }
  }

  smartDraft(input: string): string { return `[DRAF]: ${input} selesai.`; }
}

export const awangAI = new AwangService();
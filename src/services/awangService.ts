import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AWANG SKEME PRO - v22.2 (FINAL UNIFIED)
 * Gabungan cara Google Studio + Vite + Vercel Fix
 */

const MODEL_NAME = "gemini-1.5-flash"; // Gunakan nama model yang stabil

const getApiKey = (): string => {
  // 1. Kita cuba ambil cara Google Studio (yang kita jambatankan dalam vite.config)
  // @ts-ignore
  let key = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : null;

  // 2. Kalau tak jumpa, kita cuba cara standard Vite (.env)
  if (!key) {
    const meta = import.meta as any;
    key = meta.env?.VITE_GEMINI_API_KEY;
  }

  // 3. Kalau tak jumpa jugak, kita cuba suntikan rahsia
  if (!key) {
    key = (window as any).__GEMINI_KEY__;
  }

  console.log("%c--- 🕵️‍♂️ AWANG FINAL REPORT ---", "color: #10b981; font-weight: bold;");
  console.log("Status Kunci:", key ? "✅ YA (Tersedia)" : "❌ TIDAK (Hilang)");
  if (key) console.log("Panjang Kunci:", key.length, "aksara");
  console.log("%c---------------------------", "color: #10b981; font-weight: bold;");
  
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
      yield "Alamak bohh! Kunci API tak lekat lagi kat Vercel. \n\nCuba check: \n1. Vercel Settings > Env Variables.\n2. Nama mesti 'VITE_GEMINI_API_KEY'.";
      return;
    }
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: MODEL_NAME, 
        systemInstruction: CHAT_INSTRUCTION 
      });
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
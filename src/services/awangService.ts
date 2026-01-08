import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// KONFIGURASI AWANG AI (GEMINI 3 FLASH)
// ============================================================================
const MODEL_NAME = "gemini-3-flash-preview"; 
const MY_API_KEY = "AIzaSyBvZ72SDzQ5eZNHhU0DdQrYb8TzsKRkCYs"; 

export class AwangService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(MY_API_KEY);
  }

  smartDraft(input: string): string {
    const templates: Record<string, string> = {
      'KAWAD': 'Peserta telah diberikan pendedahan mengenai tatacara kawad kaki statik dan dinamik.',
      'SUKAN': 'Aktiviti latihan fizikal dijalankan bagi memantapkan kemahiran motor murid.',
    };
    const text = input.toUpperCase();
    for (const key in templates) {
      if (text.includes(key)) return `[DRAF PANTAS]: ${templates[key]}`;
    }
    return `[DRAF PANTAS]: Aktiviti ${input.toLowerCase()} telah dilaksanakan dengan jayanya.`;
  }

  async askEinstein(prompt: string): Promise<string> {
    if (!MY_API_KEY || MY_API_KEY.includes('PASTE')) return "Bohh, key takde lagi!";

    try {
      // Kita panggil model Gemini 3 Flash Preview yang mu nak tu
      const model = this.genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: "Anda adalah Awang SKeMe, pakar Kokurikulum SK Menerong. Cakap Loghat Terengganu sempoi."
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("Awang Error:", error);
      return `Aduh bohh, ada ralat: ${error.message}`;
    }
  }
}

export const awangAI = new AwangService();
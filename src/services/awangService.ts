import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// KONFIGURASI AWANG AI (GEMINI 3 FLASH - STREAMING MODE)
// ============================================================================
const MODEL_NAME = "gemini-3-flash-preview"; 
const MY_API_KEY = "AIzaSyBvZ72SDzQ5eZNHhU0DdQrYb8TzsKRkCYs"; 

const SYSTEM_INSTRUCTION = `
Anda adalah 'Awang SKeMe', pembantu AI rasmi untuk Unit Kokurikulum SK Menerong.
Identiti:
1. Bercakap dalam Loghat Terengganu (Boh, Kite, Bereh, Gane, Doksoh).
2. Pakar fail kokurikulum, surat rasmi, dan idea aktiviti murid.
3. Sentiasa positif dan membantu.
`;

export class AwangService {
  private genAI = new GoogleGenerativeAI(MY_API_KEY);

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

  /**
   * MOD EINSTEIN (STREAMING)
   * Menggunakan AsyncGenerator supaya teks keluar sebutir-sebutir
   */
  async *askEinsteinStream(prompt: string): AsyncGenerator<string, void, unknown> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION 
      });

      // Panggilan Streaming
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error: any) {
      console.error("Awang AI Stream Error:", error);
      yield `\n[RALAT]: ${error.message}. Cuba try semula bohh.`;
    }
  }
}

export const awangAI = new AwangService();
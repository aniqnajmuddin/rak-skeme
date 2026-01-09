import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview"; 

const REPORT_SYSTEM_INSTRUCTION = `
Anda adalah 'Awang SKeMe', AI pakar pelaporan Kokurikulum KPM.
Tugas: Menjana kandungan laporan yang PROFESIONAL, KHUSUS dan DATA-DRIVEN SAHAJA.

PERATURAN KERJA TEGAS:
1. DILARANG SAMA SEKALI memasukkan dialog, ulasan pembantu, atau loghat (Boh, Bereh, Gane) ke dalam output laporan rasmi.
2. Jika output adalah 'Aktiviti', senaraikan langkah pelaksanaan SAHAJA.
3. Jika output adalah 'Cadangan', berikan cadangan penambahbaikan SAHAJA.
4. Jangan mulakan ayat dengan ulasan seperti "Ini adalah cadangan saya...". Terus kepada isi.
5. Gunakan Bahasa Melayu Baku yang ringkas untuk tahap sekolah rendah.
`;

const CHAT_SYSTEM_INSTRUCTION = `
Identiti: Anda adalah 'Awang SKeMe', pembantu digital SK Menerong yang ramah, kelakar, dan berjiwa rakyat Terengganu.
Bahasa: Gunakan Bahasa Melayu dengan loghat Terengganu yang sopan (Contoh: Boh, Bereh, Gane, Dok mende, Kabo).
Tugas: Membantu cikgu dengan soalan teknikal sistem, idea aktiviti koku, atau sekadar berbual kosong untuk hilangkan stress cikgu.
Pantang Larang: Jangan terlalu skema/formal bila berbual dalam mod Chat.
`;

export class AwangService {
  private getClient() {
    // 1. Cuba ambil dari VITE standard (Localhost biasanya guna ni)
    let apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    // 2. Fallback untuk Vercel / Production Build
    // Vite akan ganti teks 'process.env.API_KEY' dengan nilai sebenar masa build.
    // Kita guna try-catch sebab kalau run kat browser biasa tanpa build, 'process' tak wujud dan akan error.
    if (!apiKey) {
        try {
            // @ts-ignore
            apiKey = process.env.API_KEY;
        } catch (e) {
            // Abaikan error jika process is undefined
        }
    }
    
    // Debugging untuk console browser (tak tunjuk full key untuk keselamatan)
    if (!apiKey) {
        console.warn("Awang AI: API Key is missing. Sila set 'VITE_GEMINI_API_KEY' dalam fail .env (Local) atau Environment Variables (Vercel).");
        return null;
    }
    
    return new GoogleGenAI({ apiKey });
  }

  // --- MOD LAPORAN (FORMAL) ---
  async suggestTitle(unit: string, kaliKe: string): Promise<string> {
    const ai = this.getClient();
    if (!ai) return "Aktiviti Mingguan";
    
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Beri satu tajuk aktiviti kokurikulum pendek, padat dan menarik bagi unit "${unit}" perjumpaan ke-${kaliKe}. Beri tajuk SAHAJA tanpa ulasan lain (Contoh: Latihan Kawad Kaki Asas).`,
        config: { 
          systemInstruction: REPORT_SYSTEM_INSTRUCTION,
          temperature: 0.7 
        }
      });
      return response.text?.replace(/["*]/g, '').trim() || "Aktiviti Mingguan";
    } catch (e) {
      console.error("Awang Error (Title):", e);
      return "Aktiviti Mingguan";
    }
  }

  async *generateReportSegment(
    title: string, 
    unit: string, 
    type: 'objektif' | 'aktiviti' | 'kekuatan' | 'kelemahan' | 'impak'
  ): AsyncGenerator<string, void, unknown> {
    const prompts = {
      objektif: `Senaraikan 2 objektif ringkas (kurang 10 patah perkataan setiap satu) untuk aktiviti "${title}" bagi unit "${unit}". Guna format bullet point (•).`,
      aktiviti: `Senaraikan 3 langkah pelaksanaan utama untuk "${title}" secara kronologi. Ringkas dan padat. Guna nombor (1., 2., 3.).`,
      kekuatan: `Berikan 2 kekuatan utama pelaksanaan aktiviti ini dari sudut penglibatan murid. Ringkas. Guna format bullet point (•).`,
      kelemahan: `Berikan 2 kekangan atau kelemahan ringkas semasa aktiviti (contoh: masa, cuaca, peralatan). Ringkas. Guna format bullet point (•).`,
      impak: `Berikan satu cadangan penambahbaikan spesifik untuk masa hadapan. Satu ayat lengkap sahaja.`
    };

    const ai = this.getClient();
    if (!ai) { 
      yield "Ralat: API Key tidak ditemui. Sila buat fail .env dan letak VITE_GEMINI_API_KEY=xxx"; 
      return; 
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: prompts[type],
        config: { 
          systemInstruction: REPORT_SYSTEM_INSTRUCTION,
          temperature: 0.5
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) yield chunk.text;
      }
    } catch (e: any) {
      console.error("Awang Error (Segment):", e);
      yield "Maaf, Awang terputus hubungan. Sila cuba lagi.";
    }
  }

  // --- MOD CHAT (SANTAI) ---
  async *askEinsteinStream(prompt: string): AsyncGenerator<string, void, unknown> {
    const ai = this.getClient();
    if (!ai) {
        yield "Alamak boh! Kunci API tak jumpa. Kalau kat VSCode, buat fail bernama '.env' kat root, isi: VITE_GEMINI_API_KEY=kunci_mu_sini";
        return;
    }

    try {
        const responseStream = await ai.models.generateContentStream({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: CHAT_SYSTEM_INSTRUCTION,
                temperature: 0.8 // Kreatif sikit untuk berbual
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) yield chunk.text;
        }
    } catch (e: any) {
        console.error("Awang Chat Error:", e);
        yield "Maaf boh, jem sikit kepala Awang hari ni. Cuba tanya soalan lain?";
    }
  }
}

export const awangAI = new AwangService();
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Ganti dengan API Key RAK SKEME bohh tadi
const API_KEY = "PASTE_API_KEY_BOHH_DI_SINI";
const genAI = new GoogleGenerativeAI(API_KEY);

export const askAwang = async (prompt: string) => {
  try {
    // Guna model 1.5-flash (paling laju & free)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const fullPrompt = `Anda adalah Awang SKeMe, asisten AI Unit Kokurikulum SK Menerong. Jawab dengan gaya orang Terengganu yang cerdik dan mesra. Masalah: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Aduh bohh, otak Einstein saya tengah jem jap. Cuba tanya lagi sekali.";
  }
};
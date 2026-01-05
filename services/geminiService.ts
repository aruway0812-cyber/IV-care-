
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResponse, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSurveyData(responses: SurveyResponse[]): Promise<AIAnalysis> {
  const responsesContext = responses.map(r => ({
    dept: r.department,
    exp: r.experienceYears,
    patient: r.patientAgeGroup,
    site: r.injectionSite,
    needle: r.needleSize,
    conf: r.confidenceLevel,
    challenges: r.topChallenges,
    text: r.feedbackText
  }));

  const prompt = `
    你是一位資深的臨床護理品質管理專家與護理教育家。
    請根據以下靜脈注射 (IV) 執行回饋數據進行深度分析：
    
    1. 總結當前臨床護理人員面臨的主要挑戰。
    2. 識別是否存在特定族群（如高齡者）或特定單位（如急診）的系統性問題。
    3. 參考國際靜脈輸液護理標準 (INS Standards)，提供具體的臨床技術、設備改善或教育訓練建議。
    
    數據資料:
    ${JSON.stringify(responsesContext)}
    
    請務必以 JSON 格式回應，包含以下欄位：
    - summary: 一段精簡的現況綜述。
    - keyIssues: 一個包含 3-5 個關鍵瓶頸的字串陣列。
    - recommendations: 一個包含 3-5 個具體改進行動建議的字串陣列。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyIssues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "keyIssues", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text) as AIAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "目前無法進行 AI 深度分析，請檢查網路連線或稍後再試。",
      keyIssues: ["數據分析中斷"],
      recommendations: ["建議手動檢視臨床回饋內容"]
    };
  }
}

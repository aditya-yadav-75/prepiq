import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptConfig, buildPrompt } from './prompts.js';
import { Question } from '../types/index.js';

export interface GeminiResponse {
  test_title: string;
  subject: string;
  topic: string;
  total_questions: number;
  difficulty: string;
  questions: Question[];
}

export class GeminiService {
  private static defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  public static isKeyAvailable(clientKey?: string): boolean {
    const key = clientKey || process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 10 && !key.includes('your_api_key'));
  }

  public static async generatePracticeExam(
    config: PromptConfig,
    clientApiKey?: string
  ): Promise<GeminiResponse> {
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please supply an API key in Settings or environment.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || this.defaultModel;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: config.version === 'v1' ? 0.4 : config.version === 'v2' ? 0.3 : 0.2,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: buildPrompt(config).systemPrompt }]
      }
    });

    const { userPrompt } = buildPrompt(config);

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    try {
      const parsed = JSON.parse(responseText) as GeminiResponse;
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Response JSON is missing questions array.');
      }
      return parsed;
    } catch (parseError: any) {
      // Attempt JSON markdown block extraction if wrapped in ```json
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      throw new Error(`Failed to parse structured JSON from Gemini response: ${parseError.message}`);
    }
  }

  public static async testConnection(apiKey: string): Promise<{ success: boolean; model: string; message: string }> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: this.defaultModel });
      const res = await model.generateContent('Respond with {"status": "ok"} in JSON format.');
      return {
        success: true,
        model: this.defaultModel,
        message: 'Successfully connected to Google Gemini API.'
      };
    } catch (err: any) {
      return {
        success: false,
        model: this.defaultModel,
        message: err.message || 'Connection test failed.'
      };
    }
  }
}

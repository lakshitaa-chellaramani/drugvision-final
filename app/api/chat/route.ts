import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Interaction from '@/models/interaction';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio'; // Optional if you want to clean HTML
import * as dotenv from 'dotenv';
dotenv.config();

// ✅ Gemini config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// console.log(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface GeminiPromptResponse {
    response: {
        text: string;
    };
}

async function getInteractionFromGemini(requestprompt: string): Promise<{ output: string }> {
    const prompt = `
You are a biomedical AI expert. Reply to *${requestprompt}* politely.

Please respond concisely, respectfully and in easy to understand terms:

Never use harsh language, controversial statements.

Stick to biomedical subjects only
`;

    const result = await model.generateContent(prompt);
    const output: string = result.response.text().trim();

    return { output };
}

export async function POST(req: NextRequest) {
    try {
      await dbConnect();
  
      const { prompt } = await req.json();
  
      const prompt_response = await getInteractionFromGemini(prompt);
  
      return NextResponse.json(prompt_response, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to evaluate', details: error }, { status: 500 });
    }
}
// app/api/interactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Interaction from '@/models/interaction';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

// ✅ Gemini config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function getInteractionFromGemini(drug1: string, drug2: string) {
  const prompt = `
You are a biomedical AI model. Analyze the potential drug-drug interaction between **${drug1}** and **${drug2}**.

Please respond ONLY in the following format:

Severity Score (out of 10): <score>
Interaction Cause: <short medical explanation>

Be extremely accurate about Severity Score.
`;

  const result = await model.generateContent(prompt);
  const output = result.response.text().trim();

  const severityMatch = output.match(/Severity Score \(out of 10\):\s*(\d+)/);
  const causeMatch = output.match(/Interaction Cause:\s*(.+)/);

  const severity = severityMatch ? parseInt(severityMatch[1]) : null;
  const description = causeMatch ? causeMatch[1].trim() : 'No cause found.';

  return { severity, description };
}

// ✅ POST /api/interactions
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { drug1, drug2, patientId } = await req.json();

    if (!drug1 || !drug2) {
      return NextResponse.json({ error: 'Both drug1 and drug2 are required.' }, { status: 400 });
    }

    // Check if this interaction already exists
    const existingInteraction = await Interaction.findOne({
      $or: [
        { drug1, drug2 },
        { drug1: drug2, drug2: drug1 } // Check both orders
      ]
    });

    if (existingInteraction) {
      // If it exists but doesn't have this patient, we can update it
      if (patientId && !existingInteraction.patient?.equals(patientId)) {
        existingInteraction.patient = patientId;
        await existingInteraction.save();
      }
      return NextResponse.json(existingInteraction, { status: 200 });
    }

    // Get interaction data from Gemini
    const { severity, description } = await getInteractionFromGemini(drug1, drug2);

    if (severity === null) {
      return NextResponse.json({ error: 'Failed to extract severity score from Gemini.' }, { status: 422 });
    }

    // Create new interaction record
    const interactionData: {
      drug1: string;
      drug2: string;
      severity: number;
      description: string;
      date: Date;
      patient?: string;
    } = {
      drug1,
      drug2,
      severity,
      description,
      date: new Date(),
    };

    // Add patient if provided
    if (patientId) {
      interactionData.patient = patientId;
    }

    const interaction = await Interaction.create(interactionData);

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to evaluate interaction', details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient');

    const filter = patientId ? { patient: patientId } : {};
    const interactions = await Interaction.find(filter).sort({ date: -1 });

    return NextResponse.json(interactions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch interactions', details: error },
      { status: 500 }
    );
  }
}
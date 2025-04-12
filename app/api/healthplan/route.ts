// /app/api/healthplan/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Medication from '@/models/medication'
import { dbConnect } from '@/lib/dbConnect'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Patient name required' }, { status: 400 })
    }

    await dbConnect()

    const meds = await Medication.find({ patient: { $regex: new RegExp(name, 'i') } })
    const medList = meds.map((m) => `${m.medication} (${m.dosage})`).join(', ') || 'no medications'

    const prompt = `
You are a healthcare assistant. Using simple and clear language, generate a personalized health plan for a patient named ${name}.

They are currently prescribed: ${medList}.

Return only a strict JSON object like this:

{
  "summary": "Short and easy to understand overview of patient’s health.",
  "medications": ["List 2-4 important medications with their purpose if known"],
  "recommendations": [
    "Tip 1 - what the patient should do daily",
    "Tip 2 - easy health habit to follow",
    "Tip 3 - something to avoid or monitor",
    "Tip 4 - lifestyle change if needed"
  ],
  "doctorFollowUp": "Simple sentence about when or why they should follow up with their doctor."
}

Do NOT explain anything else outside this format.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    const jsonStart = responseText.indexOf('{')
    const jsonEnd = responseText.lastIndexOf('}')
    const plan = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1))

    return NextResponse.json({ plan }, { status: 200 })
  } catch (error) {
    console.error('HealthPlan Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

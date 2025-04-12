import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(req: NextRequest) {
  try {
    const { drugs } = await req.json()

    if (!Array.isArray(drugs) || drugs.length < 2) {
      return NextResponse.json(
        { error: 'At least two drugs are required' },
        { status: 400 }
      )
    }

    // Create drug pairs (unique combinations)
    const pairs: [string, string][] = []
    const seen = new Set<string>()

    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const [a, b] = [drugs[i], drugs[j]].sort()
        const key = `${a}+${b}`
        if (!seen.has(key)) {
          seen.add(key)
          pairs.push([a, b])
        }
      }
    }

    // Send pairs to Gemini
    const prompt = `
You are a biomedical AI model. Check for any interactions among these drug pairs:

${pairs.map(([a, b], i) => `${i + 1}. ${a} and ${b}`).join('\n')}

For each interaction, respond in the following strict JSON format in an array:
[
  {
    "drug1": "string",
    "drug2": "string",
    "severity": number (0 to 10),
    "description": "one-liner explanation",
    "evidenceLevel": "high" | "moderate" | "low"
  }
]

Only include interactions that are significant (severity >= 2). Do not add explanations outside the JSON.
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Extract JSON from Gemini response
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    const rawJson = text.slice(jsonStart, jsonEnd + 1)

    const interactions = JSON.parse(rawJson)

    return NextResponse.json({ interactions }, { status: 200 })
  } catch (error) {
    console.error('Gemini interaction error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions', details: error },
      { status: 500 }
    )
  }
}

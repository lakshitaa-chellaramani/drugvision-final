import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file: File | null = formData.get('image') as unknown as File

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid or missing image file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const prompt = `
You are an expert biomedical model. Analyze this image of a **medicine label or packaging**.

If it is valid, extract and return the following details in JSON:
{
  "name": "Medicine Name",
  "ingredients": ["Drug A", "Drug B", "..."],
  "manufacturer": "Company name if visible",
  "dosageForm": "Tablet/Capsule/Syrup etc.",
  "strength": "e.g. 500mg",
  "instructions": "Key instructions if visible"
}

If the image is **not a medicine label**, respond with:
{ "error": "Invalid medicine image" }
Only respond in JSON. No explanation outside the JSON.
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      { text: prompt },
    ])

    const text = result.response.text()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const jsonStr = text.slice(jsonStart, jsonEnd + 1)

    const parsed = JSON.parse(jsonStr)

    if (parsed.error) {
      return NextResponse.json({ error: 'Invalid medicine image' }, { status: 400 })
    }

    return NextResponse.json(parsed, { status: 200 })
  } catch (error) {
    console.error('Gemini extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract details', details: error }, { status: 500 })
  }
}

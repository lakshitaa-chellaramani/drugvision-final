import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question } = body

    // This would be where we call the OpenAI API to get a response
    // const aiResponse = await getAIResponse(question, userMedicalHistory);

    // For now, return mock data based on common questions
    let response = ""

    if (question.toLowerCase().includes("ibuprofen") || question.toLowerCase().includes("advil")) {
      response =
        "Based on your current medications, I should caution you about taking Ibuprofen. It may interact with your Lisinopril medication and reduce its effectiveness in controlling your blood pressure. I'd recommend using Acetaminophen (Tylenol) instead for pain relief, or consulting with your doctor if you need stronger pain management."
    } else if (
      question.toLowerCase().includes("food") ||
      question.toLowerCase().includes("eat") ||
      question.toLowerCase().includes("diet")
    ) {
      response =
        "Your current medications don't have significant food restrictions, but there are some considerations:\n\n- Metformin works best when taken with meals to reduce stomach upset\n- Lisinopril can be taken with or without food\n- Try to maintain a consistent diet rich in vegetables and low in sodium to support your blood pressure management\n- Grapefruit juice should be avoided as it can interact with some medications"
    } else if (question.toLowerCase().includes("exercise") || question.toLowerCase().includes("workout")) {
      response =
        "Exercise is beneficial with your current medication regimen! Regular physical activity can help improve the effectiveness of your blood pressure and diabetes medications. Start with moderate activities like walking for 30 minutes daily, and gradually increase intensity. Remember to stay hydrated and monitor your blood sugar if you're taking Metformin. If you experience dizziness during exercise, take a break and consult your doctor."
    } else {
      response =
        "Thank you for your question. Based on your medical history and current medications, I don't see any concerns with this. However, it's always best to consult with your healthcare provider for personalized advice. Is there anything specific about your medications or health that you'd like to know more about?"
    }

    return NextResponse.json({
      success: true,
      response,
      additionalInfo: {
        relatedMedications: ["Lisinopril", "Metformin"],
        suggestedActions: [],
      },
    })
  } catch (error) {
    console.error("AI assistant error:", error)
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}

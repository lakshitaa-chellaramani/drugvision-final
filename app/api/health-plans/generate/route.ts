import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId } = body

    // This would be where we call the AI to generate a health plan
    // const patientData = await getPatientData(patientId);
    // const generatedPlan = await generateHealthPlanWithAI(patientData);

    // For now, return mock data
    return NextResponse.json({
      success: true,
      healthPlan: {
        medications: [
          { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "8:00 AM", withFood: true },
          { name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "8:00 AM, 6:00 PM", withFood: true },
        ],
        diet: [
          "Low sodium diet (less than 2,000mg per day)",
          "Limit processed foods and added sugars",
          "Increase fiber intake with whole grains, fruits, and vegetables",
          "Stay hydrated with at least 8 glasses of water daily",
        ],
        exercise: [
          "30 minutes of moderate walking 5 days per week",
          "Light resistance training 2-3 times per week",
          "Gentle stretching exercises daily",
          "Avoid high-intensity workouts without medical clearance",
        ],
        sleep: [
          "Aim for 7-8 hours of sleep each night",
          "Maintain consistent sleep and wake times",
          "Avoid caffeine after 2:00 PM",
          "Create a relaxing bedtime routine",
        ],
      },
    })
  } catch (error) {
    console.error("Health plan generation error:", error)
    return NextResponse.json({ error: "Failed to generate health plan" }, { status: 500 })
  }
}

// app/api/users/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { dbConnect } from "@/lib/dbConnect"
import Patient from "@/models/patient"
import Doctor from "@/models/doctor"

const JWT_SECRET = process.env.JWT_SECRET!

export async function PUT(req: NextRequest) {
  await dbConnect()

  // Verify authentication
  const authHeader = req.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    // Decode the token to get user ID and role
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
    const { id, role } = decoded

    // Parse the request body
    const body = await req.json()
    console.log("Request body:", body)
    
    // Extract only the allowed fields to update
    const { height, weight, allergies, chronicDiseases } = body
    
    // Prepare update object with only defined values
    const updateData: any = {}
    
    if (height !== undefined) updateData.height = height
    if (weight !== undefined) updateData.weight = weight
    if (allergies !== undefined) updateData.allergies = allergies
    if (chronicDiseases !== undefined) updateData.chronicDiseases = chronicDiseases
    
    // Update the user based on role
    let updatedUser
    
      updatedUser = await Patient.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password")
    console.log("Updated user:", updatedUser)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    })
    
  } catch (error: any) {
    console.error("Profile update error:", error)
    
    if (error.name === "ValidationError") {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.message 
      }, { status: 400 })
    }
    
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: "Failed to update profile" 
    }, { status: 500 })
  }
}
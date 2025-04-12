// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import {dbConnect} from "@/lib/dbConnect"
import Patient from "@/models/patient"
import Doctor from "@/models/doctor"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(req: NextRequest) {
  await dbConnect()

  const authHeader = req.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }

    const { id, role } = decoded

    let user
    if (role === "patient") {
      user = await Patient.findById(id).select("-password")
    } else {
      user = await Doctor.findById(id).select("-password")
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
  }
}

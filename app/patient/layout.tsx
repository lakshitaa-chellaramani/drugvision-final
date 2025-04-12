import type React from "react"
import { PatientNavbar } from "@/components/patient-navbar"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PatientNavbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

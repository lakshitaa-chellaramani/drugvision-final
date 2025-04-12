import type React from "react"
import { DoctorNavbar } from "@/components/doctor-navbar"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DoctorNavbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

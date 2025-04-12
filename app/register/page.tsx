"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Pill, Stethoscope, ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { PatientRegistrationForm } from "@/components/patient-registration-form"
import { DoctorRegistrationForm } from "@/components/doctor-registration-form"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("patient")

  useEffect(() => {
    const role = searchParams.get("role")
    if (role === "doctor" || role === "patient") {
      setActiveTab(role)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Pill className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">DrugVision</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto py-12 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Patient Registration
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Doctor Registration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <PatientRegistrationForm />
            </TabsContent>

            <TabsContent value="doctor">
              <DoctorRegistrationForm />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

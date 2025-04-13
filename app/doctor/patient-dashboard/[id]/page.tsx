"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function PatientDashboardPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPatientByName = async (name: string) => {
    try {
      const res = await fetch("/api/patients")
      const data = await res.json()
      const found = data.patients.find((p: any) => p.name.toLowerCase() === name.toLowerCase())
      return found || null
    } catch (error) {
      console.error("Error fetching patients list:", error)
      return null
    }
  }

  const fetchMedicationsByName = async (name: string) => {
    try {
      const res = await fetch("/api/medications")
      const data = await res.json()
      const filtered = data.medications.filter((m: any) => m.patient?.toLowerCase() === name.toLowerCase())
      return filtered
    } catch (error) {
      console.error("Error fetching medications:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true)
      const patientData = await fetchPatientByName(id as string)
      if (patientData) {
        setPatient(patientData)
        const meds = await fetchMedicationsByName(patientData.name)
        setMedications(meds)
      }
      setLoading(false)
    }
    if (id) fetchEverything()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!patient) {
    return <p className="text-center text-red-500">Patient not found.</p>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{patient.name}'s Dashboard</h1>

      {/* Basic Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Email:</strong> {patient.email || "N/A"}</p>
          <p><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          <p><strong>Height:</strong> {patient.height} cm</p>
          <p><strong>Weight:</strong> {patient.weight} kg</p>
          <p><strong>BMI:</strong> {(patient.weight / ((patient.height / 100) ** 2)).toFixed(1)}</p>
          <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)}</p>
        </CardContent>
      </Card>

      {/* Chronic Conditions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chronic Conditions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {patient.chronicDiseases?.length > 0 ? (
            patient.chronicDiseases.map((c: string, i: number) => (
              <Badge key={i}>{c}</Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No chronic conditions</p>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {patient.allergies?.length > 0 ? (
            patient.allergies.map((a: string, i: number) => (
              <Badge variant="outline" key={i}>{a}</Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No allergies recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Medications</CardTitle>
          <CardDescription>List of medications prescribed to the patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.length > 0 ? medications.map((med, idx) => (
            <div key={idx} className="border p-4 rounded-md space-y-1">
              <p><strong>Name:</strong> {med.medication}</p>
              <p><strong>Dosage:</strong> {med.dosage}</p>
              <p><strong>Frequency:</strong> {med.frequency}</p>
              <p><strong>Status:</strong> {med.status}</p>
              <p><strong>Time of Day:</strong> {med.timeOfDay?.join(", ") || "N/A"}</p>
              <p><strong>Prescribed By:</strong> {med.prescribedBy}</p>
            </div>
          )) : (
            <p className="text-muted-foreground">No medications found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

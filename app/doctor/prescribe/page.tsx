"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Pill, AlertTriangle, CheckCircle2, FileText, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"

// Mock data
const patients = [
  {
    id: "p1",
    name: "John Doe",
    age: 45,
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", prescribedBy: "Dr. Smith" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", prescribedBy: "Dr. Johnson" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", prescribedBy: "Dr. Smith" },
    ],
    allergies: ["Penicillin"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "p2",
    name: "Jane Smith",
    age: 62,
    conditions: ["Osteoarthritis", "Hyperlipidemia"],
    medications: [
      { name: "Simvastatin", dosage: "40mg", frequency: "Once daily", prescribedBy: "Dr. Wilson" },
      { name: "Acetaminophen", dosage: "500mg", frequency: "As needed", prescribedBy: "Dr. Wilson" },
    ],
    allergies: ["Sulfa drugs"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "p3",
    name: "Robert Johnson",
    age: 58,
    conditions: ["Coronary Artery Disease", "GERD"],
    medications: [
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily", prescribedBy: "Dr. Smith" },
      { name: "Omeprazole", dosage: "20mg", frequency: "Once daily", prescribedBy: "Dr. Brown" },
      { name: "Atenolol", dosage: "50mg", frequency: "Once daily", prescribedBy: "Dr. Smith" },
    ],
    allergies: ["Ibuprofen"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const commonMedications = [
  { name: "Lisinopril", category: "ACE Inhibitor" },
  { name: "Metformin", category: "Antidiabetic" },
  { name: "Atorvastatin", category: "Statin" },
  { name: "Levothyroxine", category: "Thyroid Hormone" },
  { name: "Amlodipine", category: "Calcium Channel Blocker" },
  { name: "Metoprolol", category: "Beta Blocker" },
  { name: "Omeprazole", category: "Proton Pump Inhibitor" },
  { name: "Simvastatin", category: "Statin" },
  { name: "Losartan", category: "ARB" },
  { name: "Albuterol", category: "Bronchodilator" },
]

export default function PrescribeMedication() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<null | {
    status: "safe" | "warning" | "danger"
    message: string
    details?: string
  }>(null)

  const [prescription, setPrescription] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
    dietRecommendations: "",
    exerciseRecommendations: "",
    sleepRecommendations: "",
  })

  const [medications, setMedications] = useState<
    Array<{
      medication: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
    }>
  >([])

  useEffect(() => {
    const patientId = searchParams.get("patient")
    if (patientId) {
      setSelectedPatientId(patientId)
      const patient = patients.find((p) => p.id === patientId)
      if (patient) {
        setSelectedPatient(patient)
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPrescription((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPrescription((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMedication = () => {
    if (!prescription.medication || !prescription.dosage || !prescription.frequency) {
      toast({
        title: "Missing information",
        description: "Please fill in medication, dosage, and frequency.",
        variant: "destructive",
      })
      return
    }

    setMedications((prev) => [
      ...prev,
      {
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      },
    ])

    // Reset medication fields
    setPrescription((prev) => ({
      ...prev,
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }))
  }

  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = () => {
    if (medications.length === 0) {
      toast({
        title: "No medications",
        description: "Please add at least one medication to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      // Mock analysis result based on medication
      const hasPotentialInteraction = medications.some(
        (med) =>
          med.medication.toLowerCase() === "warfarin" &&
          selectedPatient?.medications.some((m) => m.name.toLowerCase() === "aspirin"),
      )

      const hasMildInteraction = medications.some(
        (med) =>
          med.medication.toLowerCase() === "amlodipine" &&
          selectedPatient?.medications.some((m) => m.name.toLowerCase() === "simvastatin"),
      )

      if (hasPotentialInteraction) {
        setAnalysisResult({
          status: "danger",
          message: "Severe interaction detected",
          details:
            "Warfarin and Aspirin combination increases bleeding risk significantly. Consider alternative medication.",
        })
      } else if (hasMildInteraction) {
        setAnalysisResult({
          status: "warning",
          message: "Mild interaction detected",
          details:
            "Amlodipine may increase the blood levels of Simvastatin. Consider reducing Simvastatin dosage or using an alternative.",
        })
      } else {
        setAnalysisResult({
          status: "safe",
          message: "No significant interactions detected",
          details: "The prescribed medications appear safe to use with the patient's current regimen.",
        })
      }

      setIsAnalyzing(false)
    }, 2000)
  }

  const handleGeneratePlan = () => {
    if (medications.length === 0) {
      toast({
        title: "No medications",
        description: "Please add at least one medication to generate a plan.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate plan generation
    setTimeout(() => {
      toast({
        title: "Plan generated",
        description: "Medication plan has been generated successfully.",
      })
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.push("/doctor/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Prescribe Medication</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? `Creating prescription for ${selectedPatient.name}`
                    : "Select a patient to create a prescription"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedPatient.avatar || "/placeholder.svg"} alt={selectedPatient.name} />
                        <AvatarFallback>
                          {selectedPatient.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedPatient.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {selectedPatient.age} years • {selectedPatient.conditions.join(", ")}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.allergies.map((allergy: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                            >
                              Allergic to: {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="medication">Medication</Label>
                          <Select
                            value={prescription.medication}
                            onValueChange={(value) => handleSelectChange("medication", value)}
                          >
                            <SelectTrigger id="medication">
                              <SelectValue placeholder="Select medication" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonMedications.map((med) => (
                                <SelectItem key={med.name} value={med.name}>
                                  {med.name} ({med.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input
                            id="dosage"
                            name="dosage"
                            placeholder="e.g., 10mg"
                            value={prescription.dosage}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select
                            value={prescription.frequency}
                            onValueChange={(value) => handleSelectChange("frequency", value)}
                          >
                            <SelectTrigger id="frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Once daily">Once daily</SelectItem>
                              <SelectItem value="Twice daily">Twice daily</SelectItem>
                              <SelectItem value="Three times daily">Three times daily</SelectItem>
                              <SelectItem value="Four times daily">Four times daily</SelectItem>
                              <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                              <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                              <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                              <SelectItem value="As needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration</Label>
                          <Select
                            value={prescription.duration}
                            onValueChange={(value) => handleSelectChange("duration", value)}
                          >
                            <SelectTrigger id="duration">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7 days">7 days</SelectItem>
                              <SelectItem value="14 days">14 days</SelectItem>
                              <SelectItem value="30 days">30 days</SelectItem>
                              <SelectItem value="60 days">60 days</SelectItem>
                              <SelectItem value="90 days">90 days</SelectItem>
                              <SelectItem value="Indefinite">Indefinite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instructions">Special Instructions</Label>
                        <Textarea
                          id="instructions"
                          name="instructions"
                          placeholder="e.g., Take with food, avoid alcohol, etc."
                          value={prescription.instructions}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button onClick={handleAddMedication} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>

                    {medications.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Added Medications</h3>
                        <div className="space-y-3">
                          {medications.map((med, index) => (
                            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                              <div className="flex items-start space-x-3">
                                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                  <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{med.medication}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {med.dosage} • {med.frequency} • {med.duration || "Indefinite"}
                                  </p>
                                  {med.instructions && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Instructions: {med.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveMedication(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button onClick={handleAnalyze} variant="outline" className="w-full" disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Analyze Interactions
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {analysisResult && (
                      <Alert
                        variant={
                          analysisResult.status === "safe"
                            ? "default"
                            : analysisResult.status === "warning"
                              ? "warning"
                              : "destructive"
                        }
                        className={
                          analysisResult.status === "safe"
                            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : analysisResult.status === "warning"
                              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                              : ""
                        }
                      >
                        {analysisResult.status === "safe" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : analysisResult.status === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <AlertTitle>
                          {analysisResult.status === "safe" ? "No Interactions Detected" : analysisResult.message}
                        </AlertTitle>
                        <AlertDescription>{analysisResult.details}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleGeneratePlan}
                      className="w-full"
                      disabled={isGenerating || medications.length === 0 || analysisResult?.status !== "safe"}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Medication Plan
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p>Please select a patient from the dashboard to create a prescription.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>View patient details and history</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedPatient.avatar || "/placeholder.svg"} alt={selectedPatient.name} />
                        <AvatarFallback>
                          {selectedPatient.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedPatient.name}</h3>
                        <div className="text-sm text-muted-foreground">{selectedPatient.age} years</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Conditions</h4>
                      <ul className="list-disc pl-5">
                        {selectedPatient.conditions.map((condition: string, index: number) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Current Medications</h4>
                      {selectedPatient.medications.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {selectedPatient.medications.map((med: any, index: number) => (
                            <li key={index}>
                              {med.name} ({med.dosage}, {med.frequency}) - Prescribed by {med.prescribedBy}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No current medications.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium">Allergies</h4>
                      {selectedPatient.allergies.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {selectedPatient.allergies.map((allergy: string, index: number) => (
                            <li key={index}>{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No known allergies.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>No patient selected.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => router.push("/doctor/patients")}>
                  View Full Patient Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  User,
  Calendar,
  Clock,
  Pill,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Filter,
  Loader2
} from "lucide-react"

// Mock data for appointments - you can replace this with API calls later
const upcomingAppointments = [
  {
    id: "a1",
    patientName: "John Doe",
    date: "2023-06-15",
    time: "10:00 AM",
    reason: "Follow-up",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "a2",
    patientName: "Jane Smith",
    date: "2023-06-10",
    time: "11:30 AM",
    reason: "Medication Review",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "a3",
    patientName: "Robert Johnson",
    date: "2023-06-05",
    time: "2:00 PM",
    reason: "Follow-up",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function DoctorDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/patients')
        if (!response.ok) {
          throw new Error('Failed to fetch patients')
        }
        const data = await response.json()
        if (data.success) {
          // Transform the data to fit our UI needs
          const transformedPatients = data.patients.map(patient => ({
            ...patient,
            age: calculateAge(new Date(patient.dateOfBirth)),
            conditions: patient.chronicDiseases || [],
            // Add empty arrays for fields that might not exist in the API response
            medications: [],
            alerts: []
          }))
          setPatients(transformedPatients)
        } else {
          throw new Error(data.error || 'Failed to fetch patients')
        }
      } catch (err) {
        console.error('Error fetching patients:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const calculateAge = (birthDate) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.conditions?.some((condition) => condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patient.allergies?.some((allergy) => allergy.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle>Patient Search</CardTitle>
                <CardDescription>Search for patients by name, condition, or allergy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search patients..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error: {error}</p>
                      <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient._id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatient?._id === patient._id ? "bg-accent border-primary" : "hover:bg-accent/50"
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={patient.avatar || "/placeholder.svg"} alt={patient.name} />
                            <AvatarFallback>
                              {patient.name
                                ? patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{patient.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {patient.age} years • {patient.conditions?.join(", ") || "No conditions recorded"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {patient.allergies?.length > 0 && (
                            <Badge
                              variant="outline"
                              className="mr-2 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Allergies
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No patients found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Patient Overview</CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? `Details for ${selectedPatient.name}`
                    : "Select a patient to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedPatient.avatar || "/placeholder.svg"} alt={selectedPatient.name} />
                        <AvatarFallback>
                          {selectedPatient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                        <p className="text-muted-foreground">{selectedPatient.age} years old</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Personal Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Date of Birth:</span>
                          <span className="text-sm">{formatDate(selectedPatient.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm">{selectedPatient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Height:</span>
                          <span className="text-sm">{selectedPatient.height} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Weight:</span>
                          <span className="text-sm">{selectedPatient.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">BMI:</span>
                          <span className="text-sm">
                            {(selectedPatient.weight / ((selectedPatient.height / 100) ** 2)).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Medical Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.chronicDiseases && selectedPatient.chronicDiseases.length > 0 ? (
                          selectedPatient.chronicDiseases.map((condition, index) => (
                            <Badge key={index} variant="outline">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No allergies recorded</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Registration Date</h3>
                      <p className="text-sm">
                        {selectedPatient.createdAt ? formatDate(selectedPatient.createdAt) : "Not available"}
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/doctor/patient-dashboard/${selectedPatient.name}`)}
                      >
                        View Patient Dashboard
                      </Button>
                      {/* <Button variant="outline" className="flex-1">
                        View Full History
                      </Button> */}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a patient from the list to view their details and medical history.
                    </p>
                    <Button variant="outline">Add New Patient</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
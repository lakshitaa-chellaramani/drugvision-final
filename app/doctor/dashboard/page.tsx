"use client"

import { useState } from "react"
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
} from "lucide-react"

// Mock data
const patients = [
  {
    id: "p1",
    name: "John Doe",
    age: 45,
    lastVisit: "2023-05-15",
    nextVisit: "2023-06-15",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily" },
    ],
    alerts: [{ type: "warning", message: "Potential mild interaction between Lisinopril and Metformin" }],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "p2",
    name: "Jane Smith",
    age: 62,
    lastVisit: "2023-05-10",
    nextVisit: "2023-06-10",
    conditions: ["Osteoarthritis", "Hyperlipidemia"],
    medications: [
      { name: "Simvastatin", dosage: "40mg", frequency: "Once daily" },
      { name: "Acetaminophen", dosage: "500mg", frequency: "As needed" },
    ],
    alerts: [],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "p3",
    name: "Robert Johnson",
    age: 58,
    lastVisit: "2023-05-05",
    nextVisit: "2023-06-05",
    conditions: ["Coronary Artery Disease", "GERD"],
    medications: [
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily" },
      { name: "Omeprazole", dosage: "20mg", frequency: "Once daily" },
      { name: "Atenolol", dosage: "50mg", frequency: "Once daily" },
    ],
    alerts: [{ type: "danger", message: "Severe interaction between Aspirin and new prescription Warfarin" }],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "p4",
    name: "Mary Williams",
    age: 35,
    lastVisit: "2023-05-20",
    nextVisit: "2023-06-20",
    conditions: ["Asthma", "Allergic Rhinitis"],
    medications: [
      { name: "Albuterol", dosage: "90mcg", frequency: "As needed" },
      { name: "Fluticasone", dosage: "50mcg", frequency: "Once daily" },
    ],
    alerts: [],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

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
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.conditions.some((condition) => condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patient.medications.some((med) => med.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId)
    // In a real app, you would navigate to the patient's dashboard
    // router.push(`/doctor/patient/${patientId}`);
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
                <CardDescription>Search for patients by name, condition, or medication</CardDescription>
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
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatient === patient.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                        }`}
                        onClick={() => handlePatientSelect(patient.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={patient.avatar || "/placeholder.svg"} alt={patient.name} />
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{patient.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              {patient.age} years • {patient.conditions.join(", ")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {patient.alerts.length > 0 && (
                            <Badge
                              variant="outline"
                              className="mr-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Alert
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

            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Appointments
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Patient Alerts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled patient appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={appointment.avatar || "/placeholder.svg"}
                                alt={appointment.patientName}
                              />
                              <AvatarFallback>
                                {appointment.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{appointment.patientName}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(appointment.date).toLocaleDateString()}
                                <Clock className="h-3 w-3 ml-2 mr-1" />
                                {appointment.time}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{appointment.reason}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Appointments
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Alerts</CardTitle>
                    <CardDescription>Important alerts for your patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-red-700 dark:text-red-400">Severe Interaction Alert</h4>
                              <Badge className="ml-2 bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
                                High Priority
                              </Badge>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                              Robert Johnson has a severe interaction between Aspirin and newly prescribed Warfarin.
                            </p>
                            <div className="flex items-center mt-2">
                              <Button variant="destructive" size="sm" className="mr-2">
                                Review Prescription
                              </Button>
                              <Button variant="outline" size="sm">
                                Contact Patient
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-amber-700 dark:text-amber-400">Mild Interaction Alert</h4>
                              <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
                                Medium Priority
                              </Badge>
                            </div>
                            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                              John Doe has a potential mild interaction between Lisinopril and Metformin.
                            </p>
                            <div className="flex items-center mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900"
                              >
                                Review Prescription
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                        <div className="flex items-start space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-700 dark:text-green-400">Medication Adherence</h4>
                            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                              Mary Williams has maintained 100% medication adherence for the past 3 months.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Patient Overview</CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? `Details for ${patients.find((p) => p.id === selectedPatient)?.name}`
                    : "Select a patient to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  (() => {
                    const patient = patients.find((p) => p.id === selectedPatient)!
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={patient.avatar || "/placeholder.svg"} alt={patient.name} />
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-bold">{patient.name}</h2>
                            <p className="text-muted-foreground">{patient.age} years old</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Medical Conditions</h3>
                          <div className="flex flex-wrap gap-2">
                            {patient.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Current Medications</h3>
                          <div className="space-y-3">
                            {patient.medications.map((med, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                  <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{med.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {med.dosage} • {med.frequency}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {patient.alerts.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Alerts</h3>
                            <div className="space-y-3">
                              {patient.alerts.map((alert, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg ${
                                    alert.type === "warning"
                                      ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <AlertTriangle
                                      className={`h-4 w-4 mt-0.5 ${
                                        alert.type === "warning"
                                          ? "text-amber-600 dark:text-amber-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    />
                                    <p
                                      className={`text-sm ${
                                        alert.type === "warning"
                                          ? "text-amber-700 dark:text-amber-300"
                                          : "text-red-700 dark:text-red-300"
                                      }`}
                                    >
                                      {alert.message}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-medium mb-2">Appointments</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                Notes
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>Next Visit: {new Date(patient.nextVisit).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                Prepare
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button
                            className="flex-1"
                            onClick={() => router.push(`/doctor/prescribe?patient=${patient.id}`)}
                          >
                            Prescribe Medication
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Full History
                          </Button>
                        </div>
                      </div>
                    )
                  })()
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

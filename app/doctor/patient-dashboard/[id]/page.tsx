"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Activity, ChevronRight, Calendar, Pill, AlertCircle, User, Heart, Moon, Sun } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { ParamValue } from "next/dist/server/request/params"

export default function PatientDashboardPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { theme, setTheme } = useTheme()
  const [showForm, setShowForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    patient: patient?.name || '',
    notes: '',
    timeOfDay: [] as string[],
});

  const fetchPatientByName = async (name: ParamValue) => {
    try {
      const res = await fetch("/api/patients")
      const data = await res.json()
      const found = data.patients.find((p: { name: string }) => p.name.toLowerCase() === name.toLowerCase())
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
      const filtered = data.medications.filter((m: { patient: string }) => m.patient?.toLowerCase() === name.toLowerCase())
      return filtered
    } catch (error) {
      console.error("Error fetching medications:", error)
      return []
    }
  }

  
  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true)
      const patientData = await fetchPatientByName(id)
      if (patientData) {
        setPatient(patientData)
        const meds = await fetchMedicationsByName(patientData.name)
        setMedications(meds)
      }
      setLoading(false)
    }
    if (id) fetchEverything()
  }, [id])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 dark:text-green-500 mb-4" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">Loading patient data...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 font-semibold text-lg">Patient not found</p>
        <Button className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const bmi = (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
  const bmiCategory = getBMICategory(bmi)
  const age = calculateAge(patient.dateOfBirth)
  const nextCheckup = getNextCheckupDate(new Date())
  const medicationAdherence = calculateAdherence(medications)


 

const handleAddMedication = async () => {
  try {
    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newMedication,
        patient: patient.name,
      }),
    });

    if (res.ok) {
      alert("Medication added successfully!");
      const updatedMeds = await fetchMedicationsByName(patient.name);
      setMedications(updatedMeds);
      setShowForm(false);
      setNewMedication({
        medication: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        prescribedBy: '',
        notes: '',
        timeOfDay: [],
      });
    } else {
      const err = await res.json();
      alert("Failed: " + err.error);
    }
  } catch (err) {
    console.error("Error adding medication:", err);
    alert("An error occurred.");
  }
};


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Theme Toggle */}
        {/* <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="border-gray-200 dark:border-gray-700"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </div> */}

        {/* Header with Patient Summary */}
        <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{patient.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{age} years old • {getPatientStatus(patient)}</p>
            </div>
            {/* <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Message
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                Schedule Appointment
              </Button>
            </div> */}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-500">Overview</TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-500">Medications</TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-500">Health Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <User className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">Email</p>
                    <p className="dark:text-gray-300">{patient.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">Date of Birth</p>
                    <p className="dark:text-gray-300">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">Height</p>
                    <p className="dark:text-gray-300">{patient.height} cm</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">Weight</p>
                    <p className="dark:text-gray-300">{patient.weight} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">BMI</p>
                    <p className="dark:text-gray-300">{bmi} <span className="text-xs italic">({bmiCategory})</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-500 font-medium">Age</p>
                    <p className="dark:text-gray-300">{age} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <Activity className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Health Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Medication Adherence</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{medicationAdherence}%</span>
                    </div>
                    <Progress value={medicationAdherence} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-green-600 dark:bg-green-500" />
                  </div>

                  {/* <div className="pt-2">
                    <p className="text-sm text-gray-800 dark:text-gray-300 font-medium mb-2">Next Checkup</p>
                    <div className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <Calendar className="mr-2 h-4 w-4 text-green-600 dark:text-green-500" />
                      <span className="dark:text-gray-300">{nextCheckup.toLocaleDateString()}</span>
                    </div>
                  </div> */}
                </div>
              </CardContent>
              {/* <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center">
                <Button variant="link" className="text-green-600 dark:text-green-500">
                  View Full Health Record <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter> */}
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <AlertCircle className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Chronic Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases?.length > 0 ? (
                    patient.chronicDiseases.map((c: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
                      <Badge key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">{c}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 italic">No chronic conditions</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <AlertCircle className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <div className="flex flex-wrap gap-2">
                  {patient.allergies?.length > 0 ? (
                    patient.allergies.map((a: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
                      <Badge key={i} variant="outline" className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400">{a}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 italic">No allergies recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <Heart className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Recent Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generateMockVitals().map((vital, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-xs text-green-600 dark:text-green-500 mb-1">{vital.name}</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{vital.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{vital.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              {/* <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center">
                <Button variant="link" className="text-green-600 dark:text-green-500">
                  View Vitals History <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter> */}
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-gray-800 dark:text-white">
                  <Pill className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" />
                  Current Medications
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Medications prescribed to {patient.name}</CardDescription>
                
              </CardHeader>
              <div className="flex justify-end mb-4">
  <Button
    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
    onClick={() => setShowForm(!showForm)}
  >
    {showForm ? "Close Form" : "Add Medication"}
  </Button>
</div>

{showForm && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
    <input
      className="p-2 border rounded"
      placeholder="Medication Name"
      value={newMedication.medication}
      onChange={(e) => setNewMedication({ ...newMedication, medication: e.target.value })}
    />
    <input
      className="p-2 border rounded"
      placeholder="Dosage (e.g., 10mg)"
      value={newMedication.dosage}
      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
    />
    <select
      className="p-2 border rounded"
      value={newMedication.frequency}
      onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
    >
      <option value="">Select frequency</option>
      <option value="once a day">Once a day</option>
      <option value="twice a day">Twice a day</option>
      <option value="alternate days">Alternate days</option>
      <option value="as needed">As needed</option>
    </select>
    <input
      type="date"
      className="p-2 border rounded"
      value={newMedication.startDate}
      onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
    />
    <input
      type="date"
      className="p-2 border rounded"
      value={newMedication.endDate}
      onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
    />
    <input
      className="p-2 border rounded"
      placeholder="Prescribed By"
      value={newMedication.prescribedBy}
      onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
    />
    <textarea
      className="p-2 border rounded md:col-span-2"
      rows={3}
      placeholder="Notes"
      value={newMedication.notes}
      onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
    />
    <div className="md:col-span-2">
      <p className="font-medium mb-2">Time of Day</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {["morning", "afternoon", "evening", "night"].map((time) => (
          <label key={time} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newMedication.timeOfDay.includes(time)}
              onChange={(e) => {
                const checked = e.target.checked;
                setNewMedication((prev) => ({
                  ...prev,
                  timeOfDay: checked
                    ? [...prev.timeOfDay, time]
                    : prev.timeOfDay.filter((t) => t !== time),
                }));
              }}
            />
            {time[0].toUpperCase() + time.slice(1)}
          </label>
        ))}
      </div>
    </div>
    <div className="md:col-span-2 flex justify-end mt-4">
      <Button onClick={handleAddMedication} className="bg-green-600 hover:bg-green-700 text-white">
        Submit
      </Button>
    </div>
  </div>
)}

              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                {medications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medications.map((med, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-md hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 dark:text-white">{med.medication}</h3>
                          <Badge className={getStatusBadgeClass(med.status)}>{med.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="dark:text-gray-300"><span className="text-green-600 dark:text-green-500 font-medium">Dosage:</span> {med.dosage}</p>
                          <p className="dark:text-gray-300"><span className="text-green-600 dark:text-green-500 font-medium">Frequency:</span> {med.frequency}</p>
                          <p className="dark:text-gray-300"><span className="text-green-600 dark:text-green-500 font-medium">Time of Day:</span> {med.timeOfDay?.join(", ") || "N/A"}</p>
                          <p className="dark:text-gray-300"><span className="text-green-600 dark:text-green-500 font-medium">Prescribed By:</span> {med.prescribedBy}</p>
                          {/* <div className="pt-3 flex justify-end">
                            <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                              Details
                            </Button>
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
                    <p className="text-gray-700 dark:text-gray-300">No medications currently prescribed</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center">
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                  Medication History
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Health Metrics Tab */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-800 dark:text-white">BMI Analysis</CardTitle>
                  <CardDescription className="dark:text-gray-400">Body Mass Index Tracking</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 bg-white dark:bg-gray-800">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">{bmi}</span>
                      <Badge className={getBMIBadgeClass(bmi)}>{bmiCategory}</Badge>
                    </div>
                    
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-300 via-green-500 to-green-700 dark:from-green-700 dark:via-green-600 dark:to-green-500" 
                        style={{ width: `${Math.min(getBMIPercentage(bmi), 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm">
                      <p className="text-gray-800 dark:text-gray-300">
                        {getBMIRecommendation(bmi)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-800 dark:text-white">Health Goals</CardTitle>
                  <CardDescription className="dark:text-gray-400">Tracking progress towards health targets</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 bg-white dark:bg-gray-800">
                  <div className="space-y-4">
                    {generateMockHealthGoals().map((goal, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.name}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-green-600 dark:bg-green-500" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{goal.description}</p>
                      </div>
                    ))}
                    
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                      Add New Health Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function calculateAge(dateOfBirth: string | number | Date) {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

function getBMICategory(bmi: string) {
  const numBmi = parseFloat(bmi)
  if (numBmi < 18.5) return "Underweight"
  if (numBmi < 25) return "Normal weight"
  if (numBmi < 30) return "Overweight"
  return "Obese"
}

function getBMIBadgeClass(bmi: string) {
  const numBmi = parseFloat(bmi)
  if (numBmi < 18.5) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  if (numBmi < 25) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  if (numBmi < 30) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

function getBMIPercentage(bmi: string) {
  // This function maps BMI to a percentage for visual display (15-40 BMI range)
  const numBmi = parseFloat(bmi)
  return ((numBmi - 15) / 25) * 100
}

function getBMIRecommendation(bmi: string) {
  const numBmi = parseFloat(bmi)
  if (numBmi < 18.5) return "Consider gaining some weight through a healthy diet rich in proteins and nutrients."
  if (numBmi < 25) return "Your BMI is in the healthy range. Maintain your current lifestyle with regular exercise."
  if (numBmi < 30) return "Consider moderate weight loss through improved diet and increased physical activity."
  return "A structured weight loss program is recommended. Please consult with your healthcare provider."
}

function getStatusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'active':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case 'discontinued':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

function getPatientStatus(patient: never) {
  // Check if patient has any critical conditions
  if (patient.chronicDiseases?.some((d: string) => 
    ['diabetes', 'hypertension', 'heart disease'].includes(d.toLowerCase())
  )) {
    return "Regular Monitoring"
  }
  return "Routine Checkup"
}

function getNextCheckupDate(date: string | number | Date) {
  // Mock function to return a date 3 months in the future
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + 3)
  return nextDate
}

function calculateAdherence(medications: any[]) {
  // Mock function to calculate medication adherence
  if (!medications.length) return 0
  const activeMeds = medications.filter((m: { status: string }) => m.status?.toLowerCase() === 'active')
  return Math.round((activeMeds.length / medications.length) * 100)
}

function generateMockVitals() {
  return [
    { name: "Blood Pressure", value: "120/80", date: "Apr 1, 2025" },
    { name: "Heart Rate", value: "72 bpm", date: "Apr 1, 2025" },
    { name: "Blood Glucose", value: "95 mg/dL", date: "Apr 2, 2025" },
    { name: "SpO2", value: "98%", date: "Apr 1, 2025" },
  ]
}

function generateMockHealthGoals() {
  return [
    { 
      name: "Weight Management", 
      progress: 65, 
      description: "Goal: Reduce weight to 70kg"
    },
    { 
      name: "Physical Activity", 
      progress: 80, 
      description: "Goal: 30 minutes exercise, 5 days a week"
    },
    { 
      name: "Medication Adherence", 
      progress: 90, 
      description: "Goal: Take all medications as prescribed"
    }
  ]
}
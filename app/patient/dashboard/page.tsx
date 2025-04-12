"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Pill, Clock, CalendarIcon, Activity, AlertTriangle, CheckCircle2, BarChart4, LineChart } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartLine,
  ChartBar,
} from "@/components/ui/chart"

// Mock data
const medications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Smith",
    startDate: "2023-01-15",
    endDate: "2023-07-15",
    timeOfDay: "Morning",
    status: "active",
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    prescribedBy: "Dr. Johnson",
    startDate: "2023-02-10",
    endDate: "2023-08-10",
    timeOfDay: "Morning and Evening",
    status: "active",
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Smith",
    startDate: "2023-03-05",
    endDate: "2023-09-05",
    timeOfDay: "Evening",
    status: "active",
  },
  {
    id: 4,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    prescribedBy: "Dr. Wilson",
    startDate: "2023-05-01",
    endDate: "2023-05-14",
    timeOfDay: "Morning, Afternoon, Evening",
    status: "completed",
  },
]

const adherenceData = [
  { date: "Mon", adherence: 100 },
  { date: "Tue", adherence: 100 },
  { date: "Wed", adherence: 75 },
  { date: "Thu", adherence: 100 },
  { date: "Fri", adherence: 100 },
  { date: "Sat", adherence: 50 },
  { date: "Sun", adherence: 100 },
]

const healthMetricsData = [
  { date: "Jan", bloodPressure: 120, bloodSugar: 100, cholesterol: 180 },
  { date: "Feb", bloodPressure: 118, bloodSugar: 105, cholesterol: 175 },
  { date: "Mar", bloodPressure: 122, bloodSugar: 95, cholesterol: 170 },
  { date: "Apr", bloodPressure: 115, bloodSugar: 90, cholesterol: 165 },
  { date: "May", bloodPressure: 117, bloodSugar: 92, cholesterol: 160 },
  { date: "Jun", bloodPressure: 116, bloodSugar: 88, cholesterol: 155 },
]

const todaysMedications = medications.filter((med) => med.status === "active")

export default function PatientDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  interface UserData {
    name: string;
    // Add other user data fields as needed
  }

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists in localStorage
    const checkAuth = async () => {
      setLoading(true)
      
      // Get token from localStorage (only runs client-side)
      const token = localStorage.getItem('token')
      
      if (!token) {
        // No token found, redirect to home page
        router.push('/')
        return
      }
      
      try {
        // Token exists, fetch user data
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          // Invalid token or other API error
          throw new Error('Failed to fetch user data')
        }
        
        const data = await response.json()
        setUserData(data.user)
                
      } catch (error) {
        console.error('Authentication error:', error)
        // Clear invalid token and redirect
        localStorage.removeItem('token')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])


  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {loading ? (
          <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-6">
            {userData?.name ? `${userData.name}'s Dashboard` : "Patient Dashboard"}
          </h1>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Medications</CardTitle>
              <CardDescription>Medications to take today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysMedications.map((med) => (
                  <div key={med.id} className="flex items-start space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                      <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{med.name}</h4>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {med.dosage}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {med.timeOfDay}
                      </div>
                      <div className="text-xs text-muted-foreground">Prescribed by {med.prescribedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medication Adherence</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ChartContainer data={adherenceData} xAxisKey="date" yAxisKey="adherence" className="h-full">
                  <ChartGrid />
                  <ChartBar x="date" y="adherence" className="fill-green-500/80" />
                  <ChartXAxis />
                  <ChartYAxis />
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                </ChartContainer>
              </div>
              <div className="mt-2 text-center">
                <span className="text-sm font-medium">Weekly Adherence:</span>{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">89%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medication Calendar</CardTitle>
              <CardDescription>Schedule overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="health" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Health Metrics
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              All Medications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics History</CardTitle>
                <CardDescription>Track your health metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer data={healthMetricsData} xAxisKey="date" yAxisKey="bloodPressure" className="h-full">
                    <ChartGrid />
                    <ChartLine x="date" y="bloodPressure" strokeWidth={2} className="stroke-blue-500" />
                    <ChartLine x="date" y="bloodSugar" strokeWidth={2} className="stroke-green-500" />
                    <ChartLine x="date" y="cholesterol" strokeWidth={2} className="stroke-amber-500" />
                    <ChartXAxis />
                    <ChartYAxis />
                    <ChartTooltip>
                      <ChartTooltipContent />
                    </ChartTooltip>
                    <ChartLegend className="mt-4">
                      <ChartLegendItem name="Blood Pressure" color="blue" />
                      <ChartLegendItem name="Blood Sugar" color="green" />
                      <ChartLegendItem name="Cholesterol" color="amber" />
                    </ChartLegend>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medication History</CardTitle>
                <CardDescription>All your current and past medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start space-x-3 mb-4 md:mb-0">
                        <div
                          className={`p-2 rounded-full ${
                            med.status === "active"
                              ? "bg-green-100 dark:bg-green-900/50"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <Pill
                            className={`h-4 w-4 ${
                              med.status === "active"
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">{med.name}</h4>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {med.dosage}
                            </Badge>
                            {med.status === "active" ? (
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {med.frequency} • {med.timeOfDay}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Prescribed by {med.prescribedBy}</div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          <span>Start: {new Date(med.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          <span>End: {new Date(med.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Potential Interactions
              </CardTitle>
              <CardDescription>Medications that may interact with each other</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-700 dark:text-amber-400">Mild Interaction Detected</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                      Lisinopril and Metformin may cause a mild interaction. Monitor your blood pressure regularly.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-amber-700 dark:text-amber-400 mt-2">
                      Learn more
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400">No Severe Interactions</h4>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      Your current medication regimen has no severe interactions detected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Health Recommendations
              </CardTitle>
              <CardDescription>Personalized health insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Medication Adherence</h4>
                <Progress value={89} className="h-2 mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  You're doing well with your medication schedule. Try to maintain consistency on weekends.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Blood Pressure</h4>
                <div className="flex items-center mt-2">
                  <LineChart className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Improving</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your blood pressure readings have improved over the last 3 months. Continue with your current regimen.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium">Next Steps</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-2">
                  <li className="flex items-start">
                    <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" />
                    Schedule follow-up with Dr. Smith in 2 weeks
                  </li>
                  <li className="flex items-start">
                    <Activity className="h-4 w-4 mr-2 mt-0.5" />
                    Continue daily 30-minute walks
                  </li>
                  <li className="flex items-start">
                    <BarChart4 className="h-4 w-4 mr-2 mt-0.5" />
                    Monitor blood sugar levels twice weekly
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
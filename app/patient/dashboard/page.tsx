"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import axios from "axios" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Pill, Clock, CalendarIcon, Activity, AlertTriangle, CheckCircle2, BarChart4, LineChart, CheckCircle, X, TrendingUp, Users, PieChart } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector
} from "recharts"
import MedicationInteractions from "@/components/medication-interactions";

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
    taken: false
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
    taken: false
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
    taken: false
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
    taken: true
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

// New dashboard chart data
const monthlyAdherenceData = [
  { month: "Jan", adherence: 95 },
  { month: "Feb", adherence: 92 },
  { month: "Mar", adherence: 88 },
  { month: "Apr", adherence: 90 },
  { month: "May", adherence: 85 },
  { month: "Jun", adherence: 89 },
]

const medicationTypeData = [
  { name: "Cardiovascular", value: 35 },
  { name: "Diabetes", value: 25 },
  { name: "Cholesterol", value: 20 },
  { name: "Pain Relief", value: 10 },
  { name: "Other", value: 10 },
]

const medicationTimingData = [
  { time: "Morning", count: 35 },
  { time: "Afternoon", count: 15 },
  { time: "Evening", count: 30 },
  { time: "Bedtime", count: 20 },
]

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value 
  } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>{payload.name}</text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333">{`${value}%`}</text>
      <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#999">{`(${(percent * 100).toFixed(0)}%)`}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function PatientDashboard() {
  const [date, setDate] = useState(new Date())
  const [todaysMeds, setTodaysMeds] = useState(medications.filter(med => med.status === "active"))
  const [activeIndex, setActiveIndex] = useState(0)
  
  interface UserData {
    name: string;
    // Add other user data fields as needed
  }

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to handle medication taken status toggle
  const handleMedicationStatus = (id: number, taken: boolean) => {
    setTodaysMeds(prevMeds => 
      prevMeds.map(med => 
        med.id === id ? { ...med, taken } : med
      )
    )
    
    // This would be where we'd call the API to update the status
    // axios.post('/api/medications/status', { id, taken })
    //   .then(response => console.log('Status updated'))
    //   .catch(error => console.error('Error updating status:', error))
  }

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
        // Token exists, fetch user data - COMMENTED OUT as requested
        
        const response = await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.status !== 200) {
          // Invalid token or other API error
          throw new Error('Failed to fetch user data')
        }
        
        setUserData(response.data.user)
        
        
        // Mock user data instead
        // setUserData({ name: "John Doe" })
                
      } catch (error) {
        console.error('Authentication error:', error)
        // Clear invalid token and redirect
        localStorage.removeItem('token')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    // Fetch medications - COMMENTED OUT as requested
    /*
    const fetchMedications = async () => {
      try {
        const response = await axios.get('/api/medications')
        setTodaysMeds(response.data.filter(med => med.status === "active"))
      } catch (error) {
        console.error('Error fetching medications:', error)
      }
    }
    */
    
    checkAuth()
    // fetchMedications()
  }, [router])

  // Function to determine button status style
  const getStatusButtonStyle = (taken: boolean) => {
    return taken
      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
  }

  // Pie chart hover handler
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

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
                {todaysMeds.map((med) => (
                  <div key={med.id} className="flex items-start space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                      <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1 flex-grow">
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
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`px-3 ${getStatusButtonStyle(med.taken)}`}
                        onClick={() => handleMedicationStatus(med.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`px-3 ${getStatusButtonStyle(!med.taken)}`}
                        onClick={() => handleMedicationStatus(med.id, false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medication Adherence</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="adherence" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <span className="text-sm font-medium">Weekly Adherence:</span>{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">89%</span>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
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
          </Card> */}
          <MedicationInteractions 
  medications={todaysMeds.map(med => med.name)} 
/>
        </div>

        {/* Dashboard Charts replacing Health Metrics History - NOW USING RECHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Monthly Adherence
              </CardTitle>
              <CardDescription>6-month adherence trend</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={monthlyAdherenceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="adherence" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-500" />
                Medication Types
              </CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center">
              <div className="flex-grow h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={medicationTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {medicationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                Medication Timing
              </CardTitle>
              <CardDescription>When medications are taken</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medicationTimingData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={healthMetricsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bloodPressure" 
                        name="Blood Pressure" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bloodSugar" 
                        name="Blood Sugar" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cholesterol" 
                        name="Cholesterol" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
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

          {/* Medication Calendar with better alignment */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medication Calendar</CardTitle>
              <CardDescription>Schedule overview</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <div className="w-full max-w-sm">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={setDate} 
                  className="rounded-md border mx-auto" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
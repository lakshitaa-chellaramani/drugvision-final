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
import { Pill, Clock, CalendarIcon, Activity, FileText, Plus , AlertTriangle, CheckCircle2, BarChart4, LineChart, User } from "lucide-react"
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
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
} from "recharts"
import MedicationInteractions from "@/components/medication-interactions"

// Mock data


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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']


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

  const [medications, setMedications] = useState<any[]>([]);
  // const fetchMedications = async () => {
  //   try {
  //     const res = await fetch("/api/medications");
  //     const data = await res.json();
  //     setMedications(data.medications || []);
  //   } catch (err) {
  //     console.error("Failed to fetch medications", err);
  //   }
  // };
  const [todaysMeds, setTodaysMeds] = useState(medications.filter(med => med.status === "active"))
  

  const fetchMedications = async () => {
    try {
      const res = await fetch("/api/medications");
      const data = await res.json();
      const allMeds = data.medications || [];
  
      // ✅ Filter by current user's name or email
      const filteredMeds = allMeds.filter(
        (med: { patient: string }) => med.patient?.toLowerCase() === userData?.name?.toLowerCase()
      );
      setTodaysMeds(filteredMeds.filter((med: any) => med.status === "active"));
      setMedications(filteredMeds);
    } catch (err) {
      console.error("Failed to fetch medications", err);
    }
  };
  
  useEffect(() => {
    if (userData) {
      fetchMedications();
    }
  }, [userData]);

  const handleAddMedication = async () => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // prescribedBy: userData?.name || 'unknown',
          patient: userData?.name || 'unknown'
        })
      });
  
      const result = await res.json();
      if (res.ok) {
        alert('Medication added successfully!');
          await fetchMedications(); // 👈 Refresh data
        setFormData({
                  medication: '',
                  dosage: '',
                  frequency: '',
                  startDate: '',
                  endDate: '',
                  prescribedBy: '',
                  patient: userData?.name || '',
                  notes: '',
                  timeOfDay: [] // Ensure timeOfDay is included
                });
        setShowForm(false);
      } else {
        alert(`Failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Add Medication Error:', err);
      alert('Something went wrong.');
    }
  };
  

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    patient: userData?.name || '',
    notes: '',
    timeOfDay: [] as string[], // Added timeOfDay property
  });
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
              {medications.filter((med) => med.status === "active").map((med) => (
                  <div key={med._id} className="flex items-start space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                      <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{med.medication}</h4>
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
              <div className="h-[18px]">
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

          <MedicationInteractions 
            medications={todaysMeds.map((med: { name: any }) => med.name)} 
          />

          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medication Calendar</CardTitle>
              <CardDescription>Schedule overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          
  {/* Monthly Adherence */}
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <LineChart className="h-5 w-5 mr-2 text-green-500" />
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

  {/* Medication Types */}
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <BarChart4 className="h-5 w-5 mr-2 text-indigo-500" />
        Medication Types
      </CardTitle>
      <CardDescription>Breakdown by category</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex justify-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={medicationTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
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

  {/* Medication Timing */}
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="h-5 w-5 mr-2 text-purple-500" />
        Medication Timing
      </CardTitle>
      <CardDescription>When medications are taken</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={medicationTimingData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
</div>

        <Tabs defaultValue="health" className="mb-8">
        <Tabs defaultValue="health" className="mb-8">
  {/* Tabs Header with Button */}
  <div className="flex flex-wrap justify-between items-center mb-4">
    <TabsList className="flex gap-2">
    <TabsTrigger value="medications" className="flex items-center gap-2">
        <Pill className="h-4 w-4" />
        All Medications
      </TabsTrigger>
      <TabsTrigger value="health" className="flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Health Metrics
      </TabsTrigger>
     
    </TabsList>
    
    {/* Add Medication Button */}
    <Button variant="default" onClick={() => setShowForm(!showForm)}>
      {showForm ? "Close Form" : "Add Medication"}
    </Button>
  </div>

  {/* TabsContent: Health Metrics */}
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

  {/* TabsContent: Medications */}
  <TabsContent value="medications">
  
  {showForm && (
        <div className="mb-6 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6 bg-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Pill className="mr-2" size={20} />
            Add New Medication
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Medication Name*</label>
              <div className="relative">
                <Pill className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  className="pl-9 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter medication name"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dosage*</label>
              <input
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 10mg, 1 tablet"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Frequency*</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="">Select frequency</option>
                <option value="once a day">Once daily</option>
                <option value="twice a day">Twice daily</option>
                <option value="alternate days">Alternate days</option>
                <option value="as needed">As needed</option>
                <option value="once a week">Weekly</option>

              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Prescribed By</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  className="pl-9 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Doctor's name"
                  value={formData.prescribedBy}
                  onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  className="pl-9 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Date (if applicable)</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  className="pl-9 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Clock className="mr-2" size={16} />
              Time of Day
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                <div key={time} className="flex items-center space-x-2 border border-gray-200 rounded-md p-2 hover:bg-gray-50">
                  <input
                    id={`time-${time.toLowerCase()}`}
                    type="checkbox"
                    className="h-4 w-4 text-green-600 rounded"
                    checked={formData.timeOfDay?.includes(time.toLowerCase())}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        timeOfDay: checked
                          ? [...(prev.timeOfDay || []), time.toLowerCase()]
                          : (prev.timeOfDay || []).filter((t) => t !== time.toLowerCase()),
                      }));
                    }}
                  />
                  <label htmlFor={`time-${time.toLowerCase()}`} className="text-sm text-gray-700">{time}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FileText className="mr-2" size={16} />
              Notes
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Add special instructions or side effects to watch for"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-gray-500">* Required fields</p>
            <div className="space-x-3">
              {/* <button 
                onClick={() => setShowForm(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button> */}
              <button
                onClick={handleAddMedication}
                className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Medication
              </button>
            </div>
          </div>
        </div>
      )}


    {/* Medication History List */}
    <Card>
      <CardHeader>
        <CardTitle>Medication History</CardTitle>
        <CardDescription>All your current and past medications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No medications found.</p>
          ) : (
            medications.map((med) => (
              <div
                key={med._id}
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
                      <h4 className="font-medium">{med.medication}</h4>
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
                          {med.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {med.frequency}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Prescribed by {med.prescribedBy}
                    </div>
                    {med.drugs && med.drugs.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Drugs: {med.drugs.map((d: { name: any }) => d.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    <span>Start: {new Date(med.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    <span>
                      End:{" "}
                      {med.endDate
                        ? new Date(med.endDate).toLocaleDateString()
                        : "Ongoing"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>

{/* 
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
                    <ChartLine x="date" y="bloodPressure" strokeWidth={2} className="stroke-green-500" />
                    <ChartLine x="date" y="bloodSugar" strokeWidth={2} className="stroke-green-500" />
                    <ChartLine x="date" y="cholesterol" strokeWidth={2} className="stroke-amber-500" />
                    <ChartXAxis />
                    <ChartYAxis />
                    <ChartTooltip>
                      <ChartTooltipContent />
                    </ChartTooltip>
                    <ChartLegend className="mt-4">
                      <ChartLegendItem name="Blood Pressure" color="green" />
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
          </TabsContent> */}
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        
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
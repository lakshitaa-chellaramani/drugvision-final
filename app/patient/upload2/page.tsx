"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { 
  Upload, Camera, FileText, AlertTriangle, CheckCircle2, 
  Loader2, X, Pill, Text, Edit, Trash, Calendar 
} from "lucide-react"
import axios from "axios"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

// Define types for the extracted data
interface Medication {
  name: string
  dosage: string
  frequency: {
    morning: boolean
    afternoon: boolean
    night: boolean
  }
  duration: {
    days: number
    startDate?: string
    endDate?: string
  }
  isEditing?: boolean
}

interface PrescriptionData {
  doctor: {
    name: string
  }
  medications: Medication[]
}

interface OcrResponse {
  success: boolean
  texts: string[]
  boxes: number[][]
  image_url: string
}

export default function UploadPrescriptions() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAddingToDatabase, setIsAddingToDatabase] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null)
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const extractPrescriptionData = async (text: string) => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const prompt = `Extract all prescription information from the following text with your understanding:
"${text}"

Return a JSON object with the following structure:
{
  "doctor": {
    "name": "Doctor's full name",
  },
  "medications": [
    {
      "name": "Full medication name",
      "dosage": "Strength if specified",
      "frequency": {
        "morning": true/false,
        "afternoon": true/false,
        "night": true/false
      },
      "duration": {
        "days": "Number of days (number only)",
        "startDate": "Start date if specified",
        "endDate": "End date if specified"
      }
    }
  ]
}
start date is today and end date is today i.e 13-04-2024 + duration.
If any value is missing in the input, use null or skip.
Ensure numbers are returned as numeric values where appropriate.
Parse dosage instructions like "1-0-1" where numbers indicate morning-afternoon-night doses.`

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAmNwK1mscfNky7a37zZQGBqRfpC_1uBH0`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        }
      )

      const generatedText = response.data.candidates[0].content.parts[0].text
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/{[\s\S]*}/)
      
      const jsonContent = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '').trim() : generatedText
      const parsedData = JSON.parse(jsonContent)
      
      // Add isEditing flag to each medication
      const enhancedData = {
        ...parsedData,
        medications: parsedData.medications.map((med: Medication) => ({
          ...med,
          isEditing: false
        }))
      }
      
      setPrescriptionData(enhancedData)
      
      toast({
        title: "Analysis complete",
        description: "Your prescription has been analyzed successfully.",
      })
    } catch (err) {
      console.error('Error extracting prescription data:', err)
      setError('Failed to extract prescription data. Please try again.')
      toast({
        title: "Error processing prescription",
        description: "There was a problem analyzing your prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a prescription image or document to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      const response = await fetch("http://localhost:8000/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR request failed with status ${response.status}`)
      }

      const ocrData: OcrResponse = await response.json()
      setOcrResult(ocrData)
      
      // Combine all OCR text into a single string
      const combinedText = ocrData.texts.join("\n")
      await extractPrescriptionData(combinedText)
    } catch (error) {
      console.error("OCR API error:", error)
      toast({
        title: "Error processing image",
        description: "There was a problem analyzing your prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setPrescriptionData(null)
    setOcrResult(null)
    setError(null)
  }

  // Toggle edit mode for a medication
  const toggleEditMode = (index: number) => {
    if (prescriptionData) {
      const updatedMeds = [...prescriptionData.medications];
      updatedMeds[index] = {
        ...updatedMeds[index],
        isEditing: !updatedMeds[index].isEditing
      };
      
      setPrescriptionData({
        ...prescriptionData,
        medications: updatedMeds
      });
    }
  };

  // Update medication data while editing
  const updateMedicationField = (index: number, field: string, value: any) => {
    if (prescriptionData) {
      const updatedMeds = [...prescriptionData.medications];
      
      if (field.startsWith('frequency.')) {
        const freqField = field.split('.')[1];
        updatedMeds[index] = {
          ...updatedMeds[index],
          frequency: {
            ...updatedMeds[index].frequency,
            [freqField]: value
          }
        };
      } else if (field.startsWith('duration.')) {
        const durField = field.split('.')[1];
        updatedMeds[index] = {
          ...updatedMeds[index],
          duration: {
            ...updatedMeds[index].duration,
            [durField]: value
          }
        };
      } else {
        updatedMeds[index] = {
          ...updatedMeds[index],
          [field]: value
        };
      }
      
      setPrescriptionData({
        ...prescriptionData,
        medications: updatedMeds
      });
    }
  };
  interface UserData {
    name: string;
    // Add other user data fields as needed
  }
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  
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

  // Add medication to the database
  const addMedicationToDatabase = async (index: number) => {
    if (!prescriptionData) return;
    
    setIsAddingToDatabase(true);
    const med = prescriptionData.medications[index];
    
    try {
      // Format the medication data for the API
      const medicationData = {
        medication: med.name,
        dosage: med.dosage,
        frequency: `${med.frequency.morning ? '1' : '0'}+${med.frequency.afternoon ? '1' : '0'}+${med.frequency.night ? '1' : '0'}`,
        timeOfDay: [
          med.frequency.morning ? 'morning' : null,
          med.frequency.afternoon ? 'afternoon' : null,
          med.frequency.night ? 'night' : null
        ].filter(Boolean),
        startDate: med.duration.startDate || new Date().toISOString().split('T')[0],
        endDate: med.duration.endDate,
        status: 'active',
        prescribedBy: prescriptionData.doctor.name || 'Unknown',
        notes: "none",
        patient: userData?.name || 'unknown'
      };
      console.log(medicationData)
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicationData)
      });
      console.log(response)
      
      if (!response.ok) {
        throw new Error('Failed to add medication to database');
      }
      
      const result = await response.json();
      
      toast({
        title: "Medication Added",
        description: `${med.name} has been added to your medications.`,
        variant: "default",
      });
      
      // Remove this medication from the list
      const updatedMeds = prescriptionData.medications.filter((_, i) => i !== index);
      setPrescriptionData({
        ...prescriptionData,
        medications: updatedMeds
      });
      
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Error Adding Medication",
        description: "There was a problem adding this medication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToDatabase(false);
    }
  };

  // Add all medications to database
  const handleAddToMedications = async () => {
    if (!prescriptionData || !prescriptionData.medications.length) return;
    
    setIsAddingToDatabase(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const med of prescriptionData.medications) {
      try {
        // Format the medication data for the API
        const medicationData = {
          medication: med.name,
          dosage: med.dosage,
          frequency: `${med.frequency.morning ? '1' : '0'}-${med.frequency.afternoon ? '1' : '0'}-${med.frequency.night ? '1' : '0'}`,
          timeOfDay: [
            med.frequency.morning ? 'morning' : null,
            med.frequency.afternoon ? 'afternoon' : null,
            med.frequency.night ? 'night' : null
          ].filter(Boolean),
          startDate: med.duration.startDate || new Date().toISOString().split('T')[0],
          endDate: med.duration.endDate,
          status: 'active',
          prescribedBy: prescriptionData.doctor.name || 'Unknown',
          notes: ''
        };
        
        const response = await fetch('/api/medications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(medicationData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to add medication to database');
        }
        
        successCount++;
        
      } catch (error) {
        console.error('Error adding medication:', error);
        failCount++;
      }
    }
    
    setIsAddingToDatabase(false);
    
    if (successCount > 0) {
      toast({
        title: `${successCount} Medications Added`,
        description: `Successfully added ${successCount} medications to your profile.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        variant: "default",
      });
      
      handleClearFile();
    } else {
      toast({
        title: "Error Adding Medications",
        description: "There was a problem adding medications. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6">Upload Prescriptions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
              </TabsList>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === "upload" && "Upload Prescription"}
                    {activeTab === "camera" && "Take Photo of Prescription"}
                    {activeTab === "text" && "Enter Prescription Details"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "upload" && "Upload a photo or scan of your prescription"}
                    {activeTab === "camera" && "Take a clear photo of your prescription"}
                    {activeTab === "text" && "Manually enter the details from your prescription"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="upload" className="mt-0">
                    {!uploadedFile ? (
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Upload Prescription</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop your prescription image here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">Supports JPG, PNG, and PDF files up to 10MB</p>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={previewUrl || "/placeholder.svg?height=300&width=400"}
                            alt="Prescription preview"
                            className="w-full h-[300px] object-contain border rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleClearFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="camera" className="mt-0">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Camera className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Take a Photo</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use your device's camera to take a photo of your prescription
                      </p>
                      <Button>
                        <Camera className="mr-2 h-4 w-4" />
                        Open Camera
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-0 space-y-4">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="doctor">Prescribing Doctor</Label>
                        <Input id="doctor" placeholder="Dr. Smith" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="medication">Medication Name</Label>
                        <Input id="medication" placeholder="e.g., Lisinopril" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input id="dosage" placeholder="e.g., 10mg" />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Input id="frequency" placeholder="e.g., Once daily" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" type="date" />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="instructions">Special Instructions</Label>
                        <Input id="instructions" placeholder="e.g., Take with food" />
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpload}
                    disabled={(!uploadedFile && activeTab === "upload") || isUploading || isAnalyzing}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        {activeTab === "upload" && "Upload & Analyze"}
                        {activeTab === "camera" && "Capture & Analyze"}
                        {activeTab === "text" && "Submit & Analyze"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </Tabs>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Detected medications and prescription details</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analyzing Prescription</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      We're extracting medication information using AI.
                    </p>
                  </div>
                ) : prescriptionData ? (
                  <div className="space-y-6">
                    {/* Processed OCR image */}
                    {ocrResult && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">OCR Result</h3>
                        <img 
                          src={`http://localhost:8000${ocrResult.image_url}`} 
                          alt="Annotated prescription"
                          className="w-full border rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className="font-medium text-lg">Doctor Information</h3>
                        <p><span className="font-medium">Name:</span> {prescriptionData.doctor.name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-lg">Medications</h3>
                        {prescriptionData.medications.map((med, index) => (
                          <div key={index} className="border rounded-lg p-4 mb-4">
                            {med.isEditing ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`med-name-${index}`}>Medication Name</Label>
                                  <Input 
                                    id={`med-name-${index}`}
                                    value={med.name} 
                                    onChange={(e) => updateMedicationField(index, 'name', e.target.value)}
                                  />
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                                  <Input 
                                    id={`med-dosage-${index}`}
                                    value={med.dosage} 
                                    onChange={(e) => updateMedicationField(index, 'dosage', e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Frequency</Label>
                                  <div className="flex gap-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`morning-${index}`}
                                        checked={med.frequency.morning}
                                        onCheckedChange={(checked) => 
                                          updateMedicationField(index, 'frequency.morning', checked === true)
                                        }
                                      />
                                      <Label htmlFor={`morning-${index}`}>Morning</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`afternoon-${index}`}
                                        checked={med.frequency.afternoon}
                                        onCheckedChange={(checked) => 
                                          updateMedicationField(index, 'frequency.afternoon', checked === true)
                                        }
                                      />
                                      <Label htmlFor={`afternoon-${index}`}>Afternoon</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`night-${index}`}
                                        checked={med.frequency.night}
                                        onCheckedChange={(checked) => 
                                          updateMedicationField(index, 'frequency.night', checked === true)
                                        }
                                      />
                                      <Label htmlFor={`night-${index}`}>Night</Label>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor={`duration-${index}`}>Duration (days)</Label>
                                    <Input 
                                      id={`duration-${index}`}
                                      type="number"
                                      value={med.duration.days}
                                      onChange={(e) => updateMedicationField(index, 'duration.days', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                                    <Input 
                                      id={`start-date-${index}`}
                                      type="date"
                                      value={med.duration.startDate || new Date().toISOString().split('T')[0]}
                                      onChange={(e) => updateMedicationField(index, 'duration.startDate', e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor={`end-date-${index}`}>End Date</Label>
                                    <Input 
                                      id={`end-date-${index}`}
                                      type="date"
                                      value={med.duration.endDate || ''}
                                      onChange={(e) => updateMedicationField(index, 'duration.endDate', e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    className="w-full" 
                                    onClick={() => toggleEditMode(index)}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex flex-col">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                    <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="space-y-2 flex-1">
                                    <div>
                                      <h4 className="font-medium">{med.name}</h4>
                                      <div className="text-sm text-muted-foreground">
                                        {med.dosage}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium">Frequency:</p>
                                      <div className="flex gap-4 mt-1">
                                        {med.frequency.morning && (
                                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                                            Morning
                                          </span>
                                        )}
                                        {med.frequency.afternoon && (
                                          <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm">
                                            Afternoon
                                          </span>
                                        )}
                                        {med.frequency.night && (
                                          <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm">
                                            Night
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <p className="font-medium">Duration:</p>
                                        <p>{med.duration.days} days</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Start:</p>
                                        <p>{med.duration.startDate || new Date().toISOString().split('T')[0]}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">End:</p>
                                        <p>{med.duration.endDate || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => toggleEditMode(index)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button 
                                    className="flex-1"
                                    onClick={() => addMedicationToDatabase(index)}
                                    disabled={isAddingToDatabase}
                                  >
                                    {isAddingToDatabase ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Add to Medications
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Analysis Results Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a prescription to see analysis results.
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("upload")} className="mt-2">
                      Upload Prescription
                    </Button>
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
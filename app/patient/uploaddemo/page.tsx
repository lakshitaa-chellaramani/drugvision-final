"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Camera, FileText, AlertTriangle, CheckCircle2, Loader2, X, Pill, Text } from "lucide-react"
import axios from "axios"

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
      setPrescriptionData(parsedData)
      
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

  const handleAddToMedications = () => {
    toast({
      title: "Medications added",
      description: "The new medications have been added to your profile.",
    })
    handleClearFile()
  }

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
                                    <p>{med.duration.startDate || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">End:</p>
                                    <p>{med.duration.endDate || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleAddToMedications} className="w-full">
                      Add to My Medications
                    </Button>
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
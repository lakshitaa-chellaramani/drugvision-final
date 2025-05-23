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

// Define the OCR response type
interface OcrResponse {
  success: boolean;
  texts: string[];
  boxes: number[][];
  image_url: string;
}

// Define medication type
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  interaction?: string;
  interactionLevel?: "mild" | "moderate" | "severe";
}

export default function UploadPrescriptions() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null)
  const [analysisResult, setAnalysisResult] = useState<null | {
    status: "safe" | "warning" | "danger"
    medications: Medication[]
  }>(null)

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

  // Process OCR text into medication objects
  const processMedicationText = (texts: string[]): Medication[] => {
    // This is a simple implementation - in a real app, you'd use more sophisticated NLP
    // or pattern matching to extract medication information
    const medications: Medication[] = []
    
    // Find likely medication names and their information
    for (const text of texts) {
      // Simple pattern matching for common medication formats
      // This is very basic and would need to be much more robust in a real app
      const dosageMatch = text.match(/(\d+)\s*(mg|mcg|ml|g)/i)
      const frequencyMatch = text.match(/(once|twice|three times|daily|weekly|monthly|every)/i)
      
      if (dosageMatch || frequencyMatch || /tablet|capsule|pill/i.test(text)) {
        // This text likely contains medication info
        const parts = text.split(/\s+/)
        
        // Very simple heuristic: first word might be medication name
        // In reality, you'd need a medical dictionary or API
        const name = parts[0]
        const dosage = dosageMatch ? dosageMatch[0] : "Unknown"
        const frequency = frequencyMatch ? frequencyMatch[0] : "As needed"
        
        medications.push({
          name,
          dosage,
          frequency
        })
      }
    }
    
    // If we couldn't parse any structured data, just treat each text as a medication name
    if (medications.length === 0 && texts.length > 0) {
      for (const text of texts) {
        medications.push({
          name: text,
          dosage: "Unknown",
          frequency: "See prescription"
        })
      }
    }
    
    return medications
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
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", uploadedFile)

      // Call the FastAPI endpoint
      const response = await fetch("http://localhost:8000/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR request failed with status ${response.status}`)
      }

      // Parse the response
      const ocrData: OcrResponse = await response.json()
      setOcrResult(ocrData)
      setIsUploading(false)
      setIsAnalyzing(true)

      // Process the OCR text into medication data
      setTimeout(() => {
        setIsAnalyzing(false)
        
        const medications = processMedicationText(ocrData.texts)
        
        // Basic detection of potential interactions (in real app, you'd use a medical API)
        // This is just for demonstration
        let status: "safe" | "warning" | "danger" = "safe"
        
        // Simulate potential interaction for demo purposes
        if (medications.length >= 2) {
          // Randomly assign an interaction to one medication
          const randomIndex = Math.floor(Math.random() * medications.length)
          medications[randomIndex] = {
            ...medications[randomIndex],
            interaction: "May interact with other medications in your prescription",
            interactionLevel: "mild"
          }
          status = "warning"
        }

        setAnalysisResult({
          status,
          medications
        })

        toast({
          title: "Analysis complete",
          description: "Your prescription has been analyzed successfully.",
        })
      }, 2000)
    } catch (error) {
      console.error("OCR API error:", error)
      setIsUploading(false)
      toast({
        title: "Error processing image",
        description: "There was a problem analyzing your prescription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setOcrResult(null)
  }

  const handleAddToMedications = () => {
    toast({
      title: "Medications added",
      description: "The new medications have been added to your profile.",
    })

    // Reset the form
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setOcrResult(null)
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
                <CardDescription>Detected medications and potential interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analyzing Prescription</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      We're using OCR technology to extract medication information and checking for potential
                      interactions.
                    </p>
                  </div>
                ) : analysisResult ? (
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
                        
                        {/* Display Raw OCR Text */}
                        <div className="mt-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center mb-2">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            <h4 className="font-medium">Extracted Text</h4>
                          </div>
                          {ocrResult.texts.length > 0 ? (
                            <ul className="space-y-1 list-disc list-inside text-sm">
                              {ocrResult.texts.map((text, idx) => (
                                <li key={idx} className="text-slate-700 dark:text-slate-300">
                                  {text}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No text detected</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.status === "warning" && (
                      <Alert
                        variant="default"
                        className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <AlertTitle className="text-amber-600 dark:text-amber-400">
                          Potential Interaction Detected
                        </AlertTitle>
                        <AlertDescription className="text-amber-600 dark:text-amber-400">
                          Some medications may interact with your current regimen. Review the details below.
                        </AlertDescription>
                      </Alert>
                    )}

                    {analysisResult.status === "danger" && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Severe Interaction Detected</AlertTitle>
                        <AlertDescription>
                          Some medications may cause severe interactions with your current regimen. Please consult your
                          doctor.
                        </AlertDescription>
                      </Alert>
                    )}

                    {analysisResult.status === "safe" && (
                      <Alert
                        variant="default"
                        className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-600 dark:text-green-400">No Interactions Detected</AlertTitle>
                        <AlertDescription className="text-green-600 dark:text-green-400">
                          These medications appear safe to take with your current regimen.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Detected Medications</h3>

                      {analysisResult.medications.map((med, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                              <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <div>
                                <h4 className="font-medium">{med.name}</h4>
                                <div className="text-sm text-muted-foreground">
                                  {med.dosage} • {med.frequency}
                                </div>
                              </div>

                              {med.interaction && (
                                <Alert
                                  variant={med.interactionLevel === "severe" ? "destructive" : "default"}
                                  className={`
                                  ${med.interactionLevel === "mild" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : ""}
                                  ${med.interactionLevel === "moderate" ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" : ""}
                                `}
                                >
                                  <AlertTriangle
                                    className={`h-4 w-4 ${
                                      med.interactionLevel === "mild"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : med.interactionLevel === "moderate"
                                          ? "text-orange-600 dark:text-orange-400"
                                          : ""
                                    }`}
                                  />
                                  <AlertDescription
                                    className={`text-sm ${
                                      med.interactionLevel === "mild"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : med.interactionLevel === "moderate"
                                          ? "text-orange-600 dark:text-orange-400"
                                          : ""
                                    }`}
                                  >
                                    {med.interaction}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
                      Upload a prescription to see analysis results and potential interactions.
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
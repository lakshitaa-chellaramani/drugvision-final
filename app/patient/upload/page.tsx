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
import { Upload, Camera, FileText, AlertTriangle, CheckCircle2, Loader2, X, Pill } from "lucide-react"

export default function UploadPrescriptions() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<null | {
    status: "safe" | "warning" | "danger"
    medications: Array<{
      name: string
      dosage: string
      frequency: string
      interaction?: string
      interactionLevel?: "mild" | "moderate" | "severe"
    }>
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

  const handleUpload = () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a prescription image or document to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      setIsAnalyzing(true)

      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false)

        // Mock analysis result
        setAnalysisResult({
          status: "warning",
          medications: [
            {
              name: "Amlodipine",
              dosage: "5mg",
              frequency: "Once daily",
            },
            {
              name: "Simvastatin",
              dosage: "20mg",
              frequency: "Once daily at bedtime",
              interaction: "May interact with your current medication Lisinopril",
              interactionLevel: "mild",
            },
            {
              name: "Aspirin",
              dosage: "81mg",
              frequency: "Once daily",
            },
          ],
        })

        toast({
          title: "Analysis complete",
          description: "Your prescription has been analyzed successfully.",
        })
      }, 3000)
    }, 2000)
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
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
                    {analysisResult.status === "warning" && (
                      <Alert
                        variant="warning"
                        className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
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
                                  variant={med.interactionLevel === "severe" ? "destructive" : "warning"}
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

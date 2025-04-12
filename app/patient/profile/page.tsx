"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {Card,  CardContent,  CardDescription, CardFooter,  CardHeader,  CardTitle} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {   User,   Ruler,   Weight,   AlertCircle,   PlusCircle,   XCircle,  Heart,  Save,  ArrowLeft} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Link from "next/link"

// Profile interface
interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string; // added dateOfBirth
  height: number; // in cm
  weight: number; // in kg
  allergies: string[];
  chronicDiseases: string[];
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // New entry states
  const [newAllergy, setNewAllergy] = useState("")
  const [newChronicDisease, setNewChronicDisease] = useState("")
  
  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    dateOfBirth: "", // Added dateOfBirth with a default value
    height: 0,
    weight: 0,
    allergies: [],
    chronicDiseases: []
  })
  
  

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/')
        return
      }
      
      try {
        // Fetch user profile data
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data')
        }
        
        const data = await response.json()
        console.log('Profile data:', data)
        
        // Set profile with data from API or use default values if not available
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          dateOfBirth: data.user.dateOfBirth || "",
          height: data.user.height || 0,
          weight: data.user.weight || 0,
          allergies: data.user.allergies || [],
          chronicDiseases: data.user.chronicDiseases || []
        })
                
      } catch (error) {
        console.error('Profile fetch error:', error)
    
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [router])

  const handleSaveProfile = async () => {
    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/')
        return
      }
      
      // Only send the fields that can be updated by the user
      const updateData = {
        height: profile.height,
        weight: profile.weight,
        allergies: profile.allergies,
        chronicDiseases: profile.chronicDiseases
      }
      
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      // Show success message
      setShowSuccess(true)
      
    } catch (error) {
      console.error('Profile update error:', error)
      // In production, show an error message to the user
    } finally {
      setSaving(false)
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() !== "" && !profile.allergies.includes(newAllergy.trim())) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy.trim()]
      })
      setNewAllergy("")
    }
  }

  const removeAllergy = (allergyToRemove: string) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter(allergy => allergy !== allergyToRemove)
    })
  }

  const addChronicDisease = () => {
    if (newChronicDisease.trim() !== "" && !profile.chronicDiseases.includes(newChronicDisease.trim())) {
      setProfile({
        ...profile,
        chronicDiseases: [...profile.chronicDiseases, newChronicDisease.trim()]
      })
      setNewChronicDisease("")
    }
  }

  const removeChronicDisease = (diseaseToRemove: string) => {
    setProfile({
      ...profile,
      chronicDiseases: profile.chronicDiseases.filter(disease => disease !== diseaseToRemove)
    })
  }

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading profile...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  function calculateAge(dateOfBirth: string | undefined): React.ReactNode {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : "Invalid date";
  }

  return (
    <div className="container py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{profile.name}'s Health Profile</h1>
          <div></div> {/* Empty div to balance the flex layout */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
  <p className="text-sm text-muted-foreground">Age</p>
  <p className="font-medium">{calculateAge(profile.dateOfBirth)}</p>
</div>

              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>
                Update your physical measurements and health conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="measurements" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="measurements" className="flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Measurements
                  </TabsTrigger>
                  <TabsTrigger value="allergies" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Allergies
                  </TabsTrigger>
                  <TabsTrigger value="conditions" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Chronic Conditions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="measurements" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={profile.height}
                        onChange={(e) => setProfile({...profile, height: parseInt(e.target.value) || 0})}
                        placeholder="Enter your height in centimeters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={profile.weight}
                        onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || 0})}
                        placeholder="Enter your weight in kilograms"
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/40">
                    <h4 className="font-medium mb-2">Health Indicators</h4>
                    {profile.weight > 0 && profile.height > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">BMI (Body Mass Index)</p>
                          <p className="font-medium text-lg">
                            {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const bmi = profile.weight / Math.pow(profile.height / 100, 2);
                              if (bmi < 18.5) return "Underweight";
                              if (bmi < 25) return "Normal weight";
                              if (bmi < 30) return "Overweight";
                              return "Obesity";
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ideal Weight Range</p>
                          <p className="font-medium">
                            {(18.5 * Math.pow(profile.height / 100, 2)).toFixed(1)} - {(24.9 * Math.pow(profile.height / 100, 2)).toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Enter your height and weight to see your health indicators
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="allergies">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add new allergy" 
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                      />
                      <Button onClick={addAllergy} type="button">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    
                    {profile.allergies.length > 0 ? (
                      <div className="border rounded p-4 space-y-2">
                        <h4 className="font-medium">Current Allergies</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.allergies.map((allergy, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {allergy}
                              <XCircle 
                                className="h-3 w-3 ml-1 cursor-pointer text-muted-foreground hover:text-destructive" 
                                onClick={() => removeAllergy(allergy)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border rounded">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No allergies recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="conditions">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add new chronic condition" 
                        value={newChronicDisease}
                        onChange={(e) => setNewChronicDisease(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addChronicDisease()}
                      />
                      <Button onClick={addChronicDisease} type="button">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    
                    {profile.chronicDiseases.length > 0 ? (
                      <div className="border rounded p-4 space-y-2">
                        <h4 className="font-medium">Current Chronic Conditions</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.chronicDiseases.map((disease, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {disease}
                              <XCircle 
                                className="h-3 w-3 ml-1 cursor-pointer text-muted-foreground hover:text-destructive" 
                                onClick={() => removeChronicDisease(disease)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border rounded">
                        <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No chronic conditions recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Additional health tips section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Health Recommendations Based on Your Profile</CardTitle>
            <CardDescription>Personalized suggestions to improve your health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.weight > 0 && profile.height > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Weight Management</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {(() => {
                      const bmi = profile.weight / Math.pow(profile.height / 100, 2);
                      if (bmi < 18.5) return "Your BMI indicates you may be underweight. Consider consulting with a nutritionist for a healthy weight gain plan.";
                      if (bmi < 25) return "Your weight is within a healthy range. Maintain your current lifestyle with regular exercise and balanced diet.";
                      if (bmi < 30) return "Your BMI indicates you may be overweight. Consider increasing physical activity and focusing on a balanced diet.";
                      return "Your BMI indicates obesity. We recommend consulting with a healthcare provider to develop a personalized weight management plan.";
                    })()}
                  </p>
                </div>
              )}

              {profile.chronicDiseases.includes("Hypertension") && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Hypertension Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain regular blood pressure monitoring. Consider reducing sodium intake, 
                    increasing physical activity, and managing stress levels. Remember to take 
                    prescribed medications regularly.
                  </p>
                </div>
              )}

              {profile.chronicDiseases.includes("Diabetes") && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Diabetes Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your blood glucose levels regularly. Maintain a consistent meal schedule, 
                    choose foods low in sugar and refined carbohydrates, and engage in regular physical activity.
                  </p>
                </div>
              )}

              {profile.allergies.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Allergy Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Always carry appropriate medication if you have severe allergies. Be vigilant about 
                    reading food labels and informing healthcare providers about your allergies before treatments.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Alert Dialog */}
      {showSuccess && (
        <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Profile Updated</AlertDialogTitle>
              <AlertDialogDescription>
                Your health profile information has been successfully updated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
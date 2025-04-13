"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { fetchMedicationsByName } from "@/lib/fetchMedications";
import { 
  Send, 
  Pill, 
  User, 
  Bot, 
  Loader2,
  Copy,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string; // added dateOfBirth
  height: number; // in cm
  weight: number; // in kg
  allergies: string[];
  chronicDiseases: string[];
}
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistant() {

  const [userData, setUserData] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({
      name: "",
      email: "",
      dateOfBirth: "", // Added dateOfBirth with a default value
      height: 0,
      weight: 0,
      allergies: [],
      chronicDiseases: []
    })
    
    const router = useRouter()
  
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


  const [medications, setMedications] = useState<any[]>([]);
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
  const fetchUserAndMeds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data.user);

      const meds = await fetchMedicationsByName(data.user.name);
      setMedications(meds);
      setTodaysMeds(meds.filter((m: any) => m.status === "active"));

    } catch (err) {
      console.error("Error fetching user or medications", err);
    }
  };

  fetchUserAndMeds();
}, []);
  

  const { toast } = useToast()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your DrugVision AI assistant powered by Gemini. I can help you with questions about your medications, potential interactions, and general health advice. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [showMedicationProfile, setShowMedicationProfile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // API endpoint for your Gemini integration
  const API_ENDPOINT = "/api/chat";

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Function to copy message content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: "Message copied to clipboard",
      duration: 2000,
    })
  }

  const handleSendMessage = async (e?: React.FormEvent, predefinedMessage?: string) => {
    if (e) e.preventDefault()
  
    const messageText = predefinedMessage || inputValue
    if (!messageText.trim()) return
  
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }
  
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
  
    try {
      const medicationsContext = medications.map(
        (med) => `${med.medication} (${med.dosage}, ${med.frequency}, for ${med.purpose})`
      ).join(", ");

      const enhancedPrompt = `User Info: Name - ${profile?.name || "Unknown"}.
      Patient Details: ${JSON.stringify(profile)}
  Current medications: ${medicationsContext}.
  User Question: ${messageText}.
  IMPORTANT: Format your response using HTML tags instead of markdown. Use <b></b> for bold, <i></i> for italics, <ul><li></li></ul> for lists, etc. Don't use markdown symbols like ** or __.
  Check every field(allergies and chronic conditions) before answering. Answer clearly, in simple and short language. Add any useful medical suggestions if relevant. Consider allergies and chronic conditions too.`
  
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      })
      
      const data = await response.json()
      const geminiResponse = data.output || "I'm sorry, I couldn't process your request at this time."
  
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: geminiResponse,
        timestamp: new Date(),
      }
  
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      // error handling...
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }
  

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(undefined, question)
  }

  return (
    <div className="container py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md mr-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">DrugVision AI Assistant</h1>
              <p className="text-muted-foreground">Your personal medication interaction analyzer</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowMedicationProfile(!showMedicationProfile)}
            className="hidden sm:flex"
          >
            <Pill className="mr-2 h-4 w-4" />
            Medication Profile
          </Button>
        </div>

        {showMedicationProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Medication Profile</CardTitle>
                <CardDescription>Current medications and supplements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {medications.map((med, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Pill className="h-4 w-4 mr-2 text-primary" />
                        <h4 className="font-medium">{med.medication}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Dosage: {med.dosage}</p>
                        <p>Frequency: {med.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>AI Assistant</CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowMedicationProfile(!showMedicationProfile)}
                      className="sm:hidden"
                    >
                      <Pill className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Medication Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>Powered by Gemini • Always consult your healthcare provider</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              <div className="flex flex-col p-4 space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`group flex items-start space-x-2 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        {message.role === "user" ? (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <p 
                              className="text-sm whitespace-pre-wrap" 
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                          )}
                        </div>
                        <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-muted-foreground mr-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.role === "assistant" && (
                            <div className="flex space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy to clipboard</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Helpful</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Not helpful</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <p className="text-sm">Analyzing your request...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder="Ask about medications, food interactions, or health advice..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="hidden sm:flex" type="button">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60 p-2">
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleQuickQuestion("Can I take ibuprofen with my current medications?")}
                    >
                      <Pill className="mr-2 h-4 w-4" />
                      Ibuprofen interaction
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleQuickQuestion("Can I eat grapefruit with my medications?")}
                    >
                      <Pill className="mr-2 h-4 w-4" />
                      Grapefruit interaction
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleQuickQuestion("What side effects should I watch for with Lisinopril?")}
                    >
                      <Pill className="mr-2 h-4 w-4" />
                      Lisinopril side effects
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleQuickQuestion("When should I take my medications for best effectiveness?")}
                    >
                      <Pill className="mr-2 h-4 w-4" />
                      Medication timing
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            DrugVision AI is for informational purposes only. Always consult your healthcare provider before making medication decisions.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
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

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Sample medications for the medication profile
const userMedications = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Daily", purpose: "Blood Pressure" },
  { name: "Metformin", dosage: "500mg", frequency: "Twice Daily", purpose: "Diabetes" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "Daily at Night", purpose: "Cholesterol" }
]

export default function AIAssistant() {
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
      // Format medications context for the prompt
      const medicationsContext = userMedications.map(med => 
        `${med.name} (${med.dosage}, ${med.frequency}, for ${med.purpose})`
      ).join(", ")

      // Enhanced prompt with medication context
      const enhancedPrompt = `User's current medications: ${medicationsContext}. Question: ${messageText}`;

      // API request to your Gemini endpoint from route.js
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Get the response from your API format
      const geminiResponse = data.output || "I'm sorry, I couldn't process your request at this time.";

      // Create assistant message with the response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: geminiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })

      // Fallback response for errors
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again or check your connection.",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Focus the input field for the next message
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
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
                  {userMedications.map((med, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <Pill className="h-4 w-4 mr-2 text-primary" />
                        <h4 className="font-medium">{med.name}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Dosage: {med.dosage}</p>
                        <p>Frequency: {med.frequency}</p>
                        <p>Purpose: {med.purpose}</p>
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
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
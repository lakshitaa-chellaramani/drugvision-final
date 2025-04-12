"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Send, Pill, Apple, AlertTriangle, CheckCircle2, User, Bot, Loader2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type AnalysisResult = {
  status: "safe" | "warning" | "danger"
  message: string
  recommendation?: string
  alternatives?: string[]
}

export default function AIAssistant() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("chat")
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your DrugVision AI assistant. I can help you with questions about your medications, potential interactions, and general health advice. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response
      // In a real implementation, you would use the AI SDK:
      // const { text } = await generateText({
      //   model: openai("gpt-4o"),
      //   prompt: inputValue,
      //   system: "You are a helpful medical assistant for DrugVision. Provide accurate information about medications, potential interactions, and general health advice.",
      // });

      // Simulate response delay
      setTimeout(() => {
        let responseText = ""

        // Check for medication or food-related keywords
        const lowerCaseInput = inputValue.toLowerCase()

        if (
          lowerCaseInput.includes("ibuprofen") ||
          lowerCaseInput.includes("advil") ||
          lowerCaseInput.includes("motrin")
        ) {
          responseText =
            "Based on your current medications (Lisinopril and Metformin), taking ibuprofen occasionally at the recommended dose should be safe. However, regular use of ibuprofen while on Lisinopril may reduce its effectiveness and potentially affect your kidney function. I'd recommend acetaminophen (Tylenol) as an alternative for pain relief. Always consult your doctor before starting any new medication."

          setAnalysisResult({
            status: "warning",
            message: "Occasional use is likely safe, but regular use may interact with Lisinopril",
            recommendation: "Consider acetaminophen (Tylenol) as an alternative",
            alternatives: ["Acetaminophen (Tylenol)", "Topical pain relievers"],
          })
        } else if (lowerCaseInput.includes("grapefruit") || lowerCaseInput.includes("juice")) {
          responseText =
            "Grapefruit and grapefruit juice can interact with several medications, including statins like Atorvastatin that you're taking. This interaction can increase the concentration of the medication in your bloodstream, potentially leading to side effects. I'd recommend avoiding grapefruit while taking this medication."

          setAnalysisResult({
            status: "danger",
            message: "Grapefruit can significantly interact with Atorvastatin",
            recommendation: "Avoid grapefruit and grapefruit juice",
            alternatives: ["Orange", "Apple", "Other citrus fruits like tangerines"],
          })
        } else if (lowerCaseInput.includes("tylenol") || lowerCaseInput.includes("acetaminophen")) {
          responseText =
            "Acetaminophen (Tylenol) is generally safe to take with your current medications. Just make sure to follow the recommended dosage and not exceed 3,000 mg per day. If you need pain relief for more than a few days, it's best to consult with your doctor."

          setAnalysisResult({
            status: "safe",
            message: "No significant interactions with your current medications",
            recommendation: "Follow recommended dosage (not exceeding 3,000 mg daily)",
          })
        } else {
          responseText =
            "I understand your question about " +
            inputValue +
            ". Based on your medication profile, I don't see any immediate concerns. However, it's always best to consult with your healthcare provider before making significant changes to your medication or diet. Is there anything specific you're concerned about?"

          setAnalysisResult(null)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6">AI Health Assistant</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-primary" />
                  DrugVision AI Assistant
                </CardTitle>
                <CardDescription>Ask questions about medications, food interactions, and health advice</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="flex flex-col p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start space-x-2 max-w-[80%] ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8 mt-1">
                            {message.role === "user" ? (
                              <>
                                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2 max-w-[80%]">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="p-3 rounded-lg bg-muted flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <p className="text-sm">Thinking...</p>
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
                    placeholder="Ask about medications, food interactions, or health advice..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interaction Analysis</CardTitle>
                    <CardDescription>Analysis of potential interactions with your current medications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisResult ? (
                      <div className="space-y-4">
                        <div
                          className={`p-4 rounded-lg ${
                            analysisResult.status === "safe"
                              ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                              : analysisResult.status === "warning"
                                ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                                : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {analysisResult.status === "safe" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            ) : analysisResult.status === "warning" ? (
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            )}
                            <div>
                              <h4
                                className={`font-medium ${
                                  analysisResult.status === "safe"
                                    ? "text-green-700 dark:text-green-400"
                                    : analysisResult.status === "warning"
                                      ? "text-amber-700 dark:text-amber-400"
                                      : "text-red-700 dark:text-red-400"
                                }`}
                              >
                                {analysisResult.status === "safe"
                                  ? "Safe to Use"
                                  : analysisResult.status === "warning"
                                    ? "Use with Caution"
                                    : "Not Recommended"}
                              </h4>
                              <p
                                className={`text-sm mt-1 ${
                                  analysisResult.status === "safe"
                                    ? "text-green-600 dark:text-green-300"
                                    : analysisResult.status === "warning"
                                      ? "text-amber-600 dark:text-amber-300"
                                      : "text-red-600 dark:text-red-300"
                                }`}
                              >
                                {analysisResult.message}
                              </p>
                            </div>
                          </div>
                        </div>

                        {analysisResult.recommendation && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendation</h4>
                            <p className="text-sm text-muted-foreground">{analysisResult.recommendation}</p>
                          </div>
                        )}

                        {analysisResult.alternatives && (
                          <div>
                            <h4 className="font-medium mb-2">Alternatives</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.alternatives.map((alt, index) => (
                                <Badge key={index} variant="outline">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Save to Health Record
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="bg-primary/10 p-3 rounded-full mb-4">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Ask about a medication or food to see potential interactions with your current regimen.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInputValue("Can I take ibuprofen?")
                              setActiveTab("chat")
                            }}
                          >
                            <Pill className="mr-2 h-4 w-4" />
                            Ibuprofen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInputValue("Can I eat grapefruit?")
                              setActiveTab("chat")
                            }}
                          >
                            <Apple className="mr-2 h-4 w-4" />
                            Grapefruit
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation History</CardTitle>
                    <CardDescription>Your recent health inquiries and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Ibuprofen Inquiry</h4>
                          <Badge variant="outline" className="text-xs">
                            Yesterday
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          You asked about taking ibuprofen with your current medications.
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                        >
                          Use with Caution
                        </Badge>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Vitamin D Supplement</h4>
                          <Badge variant="outline" className="text-xs">
                            3 days ago
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          You asked about taking vitamin D supplements.
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          Safe to Use
                        </Badge>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Grapefruit Juice</h4>
                          <Badge variant="outline" className="text-xs">
                            1 week ago
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          You asked about drinking grapefruit juice with your medications.
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        >
                          Not Recommended
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

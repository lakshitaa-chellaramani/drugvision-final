"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pill, Stethoscope, ArrowLeft, Loader2 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("patient")

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Comment out actual API call
      // axios.post('/api/login', { ...values, role: activeTab })
      //   .then(response => {
      //     router.push(`/${activeTab}/dashboard`);
      //   })
      //   .catch(error => {
      //     toast({
      //       title: "Login failed",
      //       description: error.message,
      //       variant: "destructive"
      //     });
      //   });

      console.log(values, activeTab)
      toast({
        title: "Login successful",
        description: "Welcome back to DrugVision!",
      })

      if (activeTab === "patient") {
        router.push("/patient/dashboard")
      } else {
        router.push("/doctor/dashboard")
      }

      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Pill className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">DrugVision</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto py-12 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Patient Login
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Doctor Login
              </TabsTrigger>
            </TabsList>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>{activeTab === "patient" ? "Patient Login" : "Doctor Login"}</CardTitle>
                <CardDescription>
                  {activeTab === "patient"
                    ? "Log in to manage your medications and health information."
                    : "Log in to access patient records and prescribe medications."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={activeTab === "patient" ? "john.doe@example.com" : "dr.smith@hospital.com"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push(`/register?role=${activeTab}`)}
                  >
                    Register
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

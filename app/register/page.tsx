'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Pill, ArrowLeft } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    height: 0,
    weight: 0,
    allergies: '',
    chronicDiseases: '',
    specialty: '',
    medicalLicense: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Form data:', formData)
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...formData }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

        router.push('/login')
     
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DrugVision</span>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-xl shadow-lg border p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground mt-1">Choose your role and get started</p>
            </div>

            <Tabs defaultValue="patient" onValueChange={(val: string) => setRole(val as 'patient' | 'doctor')} className="mb-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>

              <TabsContent value="patient">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="name" placeholder="Full Name" onChange={handleChange} required />
                  <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                  <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                  <Input name="dateOfBirth" type="date" onChange={handleChange} required />
                  <Input name="height" type="number" placeholder="height (in cm)" onChange={handleChange} required />
                  <Input name="weight" type="number" placeholder="weight(in kg)" onChange={handleChange}  required/>
                  <Input name="allergies" placeholder="Allergies (comma separated)" onChange={handleChange} />
                  <Input name="chronicDiseases" placeholder="Chronic Diseases (comma separated)" onChange={handleChange} />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="doctor">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="name" placeholder="Full Name" onChange={handleChange} required />
                  <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                  <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                  <Input name="medicalLicense" placeholder="Medical License" onChange={handleChange} required />
                  <Input name="specialty" placeholder="Specialty" onChange={handleChange} required />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

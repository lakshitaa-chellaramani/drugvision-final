'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

interface Interaction {
  drug1: string
  drug2: string
  severity: number
  description: string
  evidenceLevel: string
}

export default function MedicationInteractions(medications: any) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInteractions() {
      try {
        setLoading(true)

        // 1. Get token and user
        const token = localStorage.getItem('token')
        if (!token) throw new Error('User not authenticated')

        const userRes = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()
        const username = userData?.user?.name?.toLowerCase()

        // 2. Fetch all medications
        const medRes = await fetch('/api/medications')
        const medData = await medRes.json()
        const meds = medData.medications || []

        const userMeds = meds.filter(
          (med: any) => med.patient?.toLowerCase() === username
        )

        const drugList = [
          ...new Set(
            userMeds.flatMap((med: any) => med.drugs?.map((d: any) => d.name))
          ),
        ]

        if (drugList.length < 2) {
          setInteractions([])
          setLoading(false)
          return
        }

        // 3. Send to Gemini
        const res = await fetch('/api/interactions/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugs: drugList }),
        })

        if (!res.ok) throw new Error('Failed to analyze interactions')

        const result = await res.json()
        setInteractions(result.interactions || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInteractions()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const severe = interactions.filter(i => i.severity >= 7)
  const moderate = interactions.filter(i => i.severity >= 4 && i.severity < 7)
  const mild = interactions.filter(i => i.severity < 4)

  const renderSection = (
    title: string,
    icon: any,
    color: string,
    items: Interaction[]
  ) => (
    <div className={`rounded-lg border p-4 bg-${color}-50 dark:bg-${color}-950/20 mb-4`}>
      <div className="flex items-start space-x-3">
        {icon}
        <div>
          <h4 className={`font-medium text-${color}-700 dark:text-${color}-400`}>{title}</h4>
          {items.map((int, i) => (
            <div key={i} className="mt-2 pb-2 border-b last:border-b-0">
              <p className={`text-sm font-medium text-${color}-600 dark:text-${color}-300`}>
                {int.drug1} + {int.drug2}
              </p>
              <p className={`text-sm text-${color}-600 dark:text-${color}-300 mt-1`}>
                {int.description} <br />
                <span className="text-xs italic">
                  Severity: {int.severity}/10 • Evidence: {int.evidenceLevel}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Potential Interactions
        </CardTitle>
        <CardDescription>AI-detected drug interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {severe.length > 0 && renderSection('Severe Interactions', <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />, 'red', severe)}
        {moderate.length > 0 && renderSection('Moderate Interactions', <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />, 'amber', moderate)}
        {mild.length > 0 && renderSection('Mild Interactions', <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />, 'blue', mild)}
        {interactions.length === 0 && (
          <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400">No Interactions Detected</h4>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Your current medication regimen has no known interactions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

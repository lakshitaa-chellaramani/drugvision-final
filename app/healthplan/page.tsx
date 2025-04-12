'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, CalendarIcon, Stethoscope, HeartPulse, Activity, PlusSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function HealthPlanPage() {
  const [userData, setUserData] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Invalid or expired token')

        const data = await res.json()
        setUserData(data.user)

        const planRes = await fetch('/api/healthplan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.user.name })
        })

        const planData = await planRes.json()
        setPlan(planData.plan)
      } catch (err) {
        console.error('Auth or Plan error:', err)
        localStorage.removeItem('token')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [router])

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
        <p className="mt-3 text-muted-foreground text-sm">Creating your personalized health strategy...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-xl border border-blue-100 dark:border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-green-700 dark:text-green-400">
              <HeartPulse className="h-6 w-6" />
              Your Personalized Health Plan
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              A summary of your medications and lifestyle guidance curated just for you, <span className="font-medium">{userData?.name}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Summary */}
            <div className="bg-muted p-4 rounded-md border">
              <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Health Overview
              </h4>
              <p className="text-sm text-muted-foreground">{plan?.summary}</p>
            </div>

            {/* Medications */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <PlusSquare className="h-4 w-4" />
                Current Medications
              </h4>
              {plan?.medications?.length > 0 ? (
                <ul className="text-sm text-muted-foreground list-disc pl-6">
                  {plan.medications.map((med: string, idx: number) => (
                    <li key={idx} className="mb-1">{med}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No current medications listed.</p>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Daily Wellness Tips
              </h4>
              <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
                {plan?.recommendations?.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Doctor Follow-up */}
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <CalendarIcon className="h-4 w-4" />
              Doctor Follow-up: <span className="ml-1">{plan?.doctorFollowUp}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

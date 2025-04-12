'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

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
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      <div className="container py-8 text-center">
        <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Generating your health plan...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Personalized Health Plan</CardTitle>
          <CardDescription>For {userData?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{plan?.summary}</p>
          <div>
            <h4 className="font-semibold mb-1">Medications</h4>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              {plan?.medications?.map((med: string, idx: number) => (
                <li key={idx}>{med}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Recommendations</h4>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              {plan?.recommendations?.map((tip: string, idx: number) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="text-sm text-blue-600 font-medium">
            Doctor Follow-up: {plan?.doctorFollowUp}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

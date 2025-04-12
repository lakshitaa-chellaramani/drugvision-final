"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Pill, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ScanLabelPage() {
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!image) return

    setLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append("image", image)

    try {
      const res = await fetch("/api/medicallabel", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")

      if (!data.valid) {
        setError("This image does not appear to contain a valid medicine label.")
      } else {
        setResult(data.details)
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            Scan Medicine Label
          </CardTitle>
          <CardDescription>Upload an image of a medicine label to extract drug information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUpload} disabled={loading || !image}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 border bg-red-50 text-red-700 rounded flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Extracted Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <strong>Name:</strong> {result.name}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Ingredients:</strong> {result.ingredients.join(", ")}
                  </p>
                  {result.details && (
                    <p className="text-sm mt-2">
                      <strong>Other Details:</strong> {result.details}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

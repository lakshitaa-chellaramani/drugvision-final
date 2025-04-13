// components/HydrationProvider.jsx
"use client"
import React, { useState, useEffect } from 'react'

export default function HydrationProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  return (
    <>
      <div style={{ display: isHydrated ? 'none' : 'block' }}>
        {/* Simple loading state or skeleton UI */}
      </div>
      <div style={{ display: isHydrated ? 'block' : 'none' }}>
        {children}
      </div>
    </>
  )
}
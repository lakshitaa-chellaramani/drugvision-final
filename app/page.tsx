"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Pill, Stethoscope, Shield, Activity } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pill className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">DrugVision</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Medication Management for Better Health
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              DrugVision helps patients and doctors manage medications safely, detect potential drug interactions, and
              make informed health decisions.
            </p>
            <div className="flex gap-4">
              <Link href="/register?role=patient">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  For Patients <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=doctor">
                <Button size="lg" variant="outline">
                  For Doctors <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-green-100 dark:border-green-900">
              <img
                src="/placeholder.svg?height=300&width=500"
                alt="DrugVision Dashboard Preview"
                className="rounded-lg w-full"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-green-100 dark:border-green-900">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit mb-4">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Detect Drug Interactions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically identify potential drug interactions and allergic risks based on your medical history.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-green-100 dark:border-green-900">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit mb-4">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Your Medications</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep track of all your medications, dosages, and schedules in one convenient dashboard.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-green-100 dark:border-green-900">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full w-fit mb-4">
              <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Health Assistant</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized health insights and recommendations from our advanced AI assistant.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto py-12 border-t border-green-100 dark:border-green-900/50 mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Pill className="h-6 w-6 text-green-500" />
            <span className="text-lg font-bold text-green-600 dark:text-green-400">DrugVision</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DrugVision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

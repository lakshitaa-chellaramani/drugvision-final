"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, 
  Pill, 
  Stethoscope, 
  Shield, 
  Activity,
  ChevronDown,
  Bell,
  Calendar,
  Clock,
  CheckCircle2
} from "lucide-react"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Features data for animation staggering
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />,
      title: "Detect Drug Interactions",
      description: "Automatically identify potential drug interactions and allergic risks based on your medical history.",
    },
    {
      icon: <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />,
      title: "Track Your Medications",
      description: "Keep track of all your medications, dosages, and schedules in one convenient dashboard.",
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />,
      title: "AI Health Assistant",
      description: "Get personalized health insights and recommendations from our advanced AI assistant.",
    },
  ]
  
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content: "DrugVision has transformed how I monitor patient medications. The interaction alerts have prevented several potential complications."
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content: "Managing my chronic condition has never been easier. The reminders ensure I never miss a dose."
    },
    {
      name: "Dr. Robert Williams",
      role: "Pharmacist",
      content: "The most comprehensive medication management platform I've recommended to my patients. Intuitive and reliable."
    }
  ]

  // Background animation particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-gray-900 overflow-x-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-green-500 opacity-10 dark:opacity-20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: ["0%", "100%"],
              x: [`${particle.x}%`, `${particle.x + (Math.random() * 20 - 10)}%`],
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Animated gradient mesh */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(74,222,128,0.05)_0%,rgba(20,184,166,0.03)_100%)]"></div>
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-full h-full opacity-30 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.3) 0%, rgba(52,211,153,0) 70%)",
            width: "150%",
            height: "150%"
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-0 right-0 w-1/2 h-1/2 opacity-30 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)"
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>
      
      {/* Hero section DNA-like animated background */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={`dna-${i}`}
            className="absolute h-1 rounded-full bg-gradient-to-r from-green-200 to-green-400 dark:from-green-700 dark:to-green-500 opacity-30 dark:opacity-20"
            style={{
              width: `${Math.random() * 30 + 20}%`,
              left: `${Math.random() * 80}%`,
              top: `${i * 10 + Math.random() * 5}%`,
            }}
            animate={{
              x: [-50, 50, -50],
              scaleX: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
          isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md" : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            >
              <Pill className="h-8 w-8 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">DrugVision</h1>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button 
                variant="ghost"
                className="relative overflow-hidden group"
              >
                <span>Login</span>
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" 
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-green-600 hover:bg-green-700">Register</Button>
              </motion.div>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto pt-32 pb-12 relative z-10">
        {/* Hero Section with Parallax Effect */}
        <motion.div 
          className="relative"
          style={{ opacity, scale, y }}
        >
          {/* Animated blobs in hero section */}
          <motion.div 
            className="absolute -z-10 top-20 right-10 w-64 h-64 rounded-full bg-green-300/20 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
          
          <motion.div 
            className="absolute -z-10 -top-10 -left-10 w-72 h-72 rounded-full bg-green-400/20 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, -90, -180, -270, -360],
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />

          {/* Animated wave patterns */}
          <div className="absolute -z-10 left-0 right-0 top-1/2 transform -translate-y-1/2 overflow-hidden h-64 opacity-30 dark:opacity-20">
            {Array.from({ length: 4 }, (_, i) => (
              <motion.div
                key={`wave-${i}`}
                className="absolute h-16 w-full"
                style={{
                  top: `${i * 25}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2310B981' fill-opacity='0.2' d='M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,266.7C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                animate={{
                  x: [`${i % 2 === 0 ? '0%' : '-100%'}`, `${i % 2 === 0 ? '-100%' : '0%'}`],
                }}
                transition={{
                  duration: 15 + i * 5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
              />
            ))}
          </div>
          
          {/* Animated circles in grid pattern */}
          <div className="absolute -z-10 w-full h-full overflow-hidden opacity-20">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={`circle-${i}`}
                className="absolute w-4 h-4 rounded-full bg-green-500 dark:bg-green-400"
                style={{
                  left: `${(i % 5) * 25}%`,
                  top: `${Math.floor(i / 5) * 25}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i % 4,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.h2 
              className="text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <motion.span 
                className="inline-block"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Smart Medication
              </motion.span>{" "}
              <motion.div 
                className="inline-block text-green-600 dark:text-green-400 relative"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                Management
                <motion.div 
                  className="absolute -z-10 bottom-0 left-0 right-0 h-3 bg-green-200 dark:bg-green-800/50"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </motion.div>{" "}
              <motion.span 
                className="inline-block"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
              >
                for Better Health
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              DrugVision helps patients and doctors manage medications safely, detect potential drug interactions, and
              make informed health decisions.
            </motion.p>
            
            <motion.div 
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              <Link href="/register?role=patient">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 relative overflow-hidden group">
                    <span className="relative z-10">For Patients</span>
                    <motion.span
                      className="absolute inset-0 bg-green-700"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/register?role=doctor">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20">
                    For Doctors <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 mt-12 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
              <span>Scroll to explore</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 perspective"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.div
              className="relative"
              initial={{ rotateY: -15 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-green-100 dark:border-green-900"
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Dashboard Mockup */}
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">DrugVision Dashboard</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">Welcome back, Alex!</h3>
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-100 dark:border-green-900"
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Upcoming</span>
                      </div>
                      <div className="text-lg font-bold">3 Medications</div>
                    </motion.div>
                    
                    <motion.div
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-100 dark:border-green-900"
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                      <div className="text-lg font-bold">2 Today</div>
                    </motion.div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-100 dark:border-green-900 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Today's Schedule</div>
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <motion.div 
                        className="p-2 bg-green-50 dark:bg-green-900/20 rounded flex justify-between items-center"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <div className="font-medium">Lisinopril</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">10mg - With breakfast</div>
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">8:00 AM</div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-2 bg-green-50 dark:bg-green-900/20 rounded flex justify-between items-center"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <div className="font-medium">Metformin</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">500mg - With lunch</div>
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">12:30 PM</div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-2 bg-green-50 dark:bg-green-900/20 rounded flex justify-between items-center"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <div className="font-medium">Atorvastatin</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">20mg - Before bed</div>
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">9:00 PM</div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.button
                    className="w-full py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg font-medium"
                    whileHover={{ backgroundColor: "#dcfce7", scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Full Schedule
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Floating elements with pulse animations */}
              <motion.div
                className="absolute -right-8 -bottom-8 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg shadow-lg border border-green-200 dark:border-green-800"
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: -5 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ y: -5, rotate: 0 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(16, 185, 129, 0.4)",
                        "0 0 0 10px rgba(16, 185, 129, 0)",
                        "0 0 0 0 rgba(16, 185, 129, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">No Interactions Found</span>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute -left-6 top-12 bg-green-500 p-3 rounded-lg shadow-lg text-white"
                initial={{ opacity: 0, x: -20, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 5 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                whileHover={{ x: -5, rotate: 0 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Activity className="h-5 w-5" />
                  </motion.div>
                  <span className="text-sm font-medium">98% Adherence</span>
                </div>
              </motion.div>
              
              {/* New floating pill animation */}
              <motion.div
                className="absolute -right-12 top-1/4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-green-100 dark:border-green-900"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: [0, 5, 0, -5, 0] }}
                transition={{ 
                  delay: 1.6, 
                  duration: 0.5,
                  rotate: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Pill className="h-6 w-6 text-green-500" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated line separator */}
        <div className="my-24 relative">
          <motion.div 
            className="absolute left-0 right-0 h-px bg-green-200 dark:bg-green-800/50"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          />
          <motion.div 
            className="w-4 h-4 bg-green-500 rounded-full mx-auto relative -top-2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1 }}
          />
        </div>

        {/* Features Section with Staggered Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Background pattern for features section */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <svg className="absolute top-0 left-0 w-full h-full opacity-5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              Features that Make a Difference
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Our platform combines medical expertise with cutting-edge technology to provide comprehensive medication management.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-100 dark:border-green-900 transition-all"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.1)",
                  borderColor: "#10b981"
                }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.7 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Animated statistics section */}
        <motion.div
          className="my-24 py-16 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={`stat-bg-${i}`}
                className="absolute bg-white dark:bg-green-500 rounded-full opacity-10"
                style={{
                  width: `${Math.random() * 300 + 100}px`,
                  height: `${Math.random() * 300 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 50 - 25],
                  y: [0, Math.random() * 50 - 25],
                  scale: [1, Math.random() * 0.3 + 0.9, 1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-10">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                Making Healthcare Safer
              </motion.h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["#10b981", "#047857", "#10b981"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    98%
                  </motion.span>
                </motion.div>
                <p className="text-gray-600 dark:text-gray-300">Medication Adherence Rate</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["#10b981", "#047857", "#10b981"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    75%
                  </motion.span>
                </motion.div>
                <p className="text-gray-600 dark:text-gray-300">Reduction in Medication Errors</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                >
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["#10b981", "#047857", "#10b981"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    10k+
                  </motion.span>
                </motion.div>
                <p className="text-gray-600 dark:text-gray-300">Healthcare Professionals</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Testimonials Section */}
        <div className="my-24">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Join thousands of patients and healthcare professionals who trust DrugVision.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  <div className="mb-4 text-green-500">
                    {/* Quote marks */}
                    <svg className="h-10 w-10 opacity-20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.content}"</p>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  {/* Decorative element */}
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full -z-10"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Call to Action Section */}
        <motion.div
          className="my-24 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={`cta-pattern-${i}`}
                className="absolute bg-white opacity-5 rounded-full"
                style={{
                  width: `${Math.random() * 400 + 200}px`,
                  height: `${Math.random() * 400 + 200}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 60 - 30],
                  y: [0, Math.random() * 60 - 30],
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2
                className="text-3xl font-extrabold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                Ready to Transform Your Medication Management?
              </motion.h2>
              
              <motion.p
                className="text-xl text-green-100 mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Join thousands of patients and healthcare professionals who trust DrugVision to make medication management safer and more efficient.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 w-full sm:w-auto">
                      Get Started Free
                    </Button>
                  </motion.div>
                </Link>
                
                <Link href="/demo">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                      Schedule Demo
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white dark:bg-gray-950 border-t border-green-100 dark:border-green-900/30">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Pill className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-green-600 dark:text-green-400">DrugVision</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The smart medication management platform for patients and healthcare professionals.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30"></div>
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30"></div>
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30"></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Features</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">API</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Integration</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Guides</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Support</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">About Us</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Contact</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} DrugVision. All rights reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
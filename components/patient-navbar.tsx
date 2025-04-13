"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pill, LayoutDashboard, Upload, MessageSquare, User, Settings, LogOut, Menu, X, Clipboard } from "lucide-react"

const navItems = [
  {
    name: "Dashboard",
    href: "/patient/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Upload Prescriptions",
    href: "/patient/uploaddemo",
    icon: Upload,
  },
  {
    name: "AI Assistant",
    href: "/patient/assistant",
    icon: MessageSquare,
  },
  {
    name: "HealthPlan",
    href: "/patient/healthplan",
    icon: Clipboard,
  },
  {
    name: "Symptom Checker",
    href: "/patient/symptom-checker",
    icon: Pill,
  },
]

export function PatientNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    event.preventDefault();
    // Clear user session or token (example: localStorage or cookies)
    localStorage.removeItem("token");
    // Redirect to login page
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/patient/dashboard">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Pill className="h-6 w-6 text-green-500" />
              <h1 className="text-xl font-bold text-green-600 dark:text-green-400 hidden md:block">DrugVision</h1>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary relative px-3 py-2 rounded-md",
                pathname === item.href ? "text-primary bg-accent" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
              {pathname === item.href && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 w-full bg-primary rounded-full"
                  layoutId="navbar-indicator"
                  transition={{ type: "spring", duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/patient/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary py-3 px-4 rounded-md",
                  pathname === item.href ? "text-primary bg-accent" : "text-muted-foreground",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  )
}
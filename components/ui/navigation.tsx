"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import InvoicelyLogo from "@/components/ui/invoicely-logo"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
      <div className={`flex items-center justify-between px-8 py-4 w-full relative transition-all duration-300 rounded-2xl ${
        scrolled 
          ? 'backdrop-blur-md bg-white/10 border border-white/20 shadow-lg' 
          : ''
      }`}>
        <InvoicelyLogo 
          width={120} 
          height={40}
          className="bg-transparent"
          color="white"
        />

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <a 
            href="#features" 
            className="text-white/80 hover:text-white transition-colors font-medium"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Features
          </a>
          <a 
            href="#about" 
            className="text-white/80 hover:text-white transition-colors font-medium"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Meet Our Team
          </a>
        </div>

        {/* Login Button - Right */}
        <div className="hidden md:flex items-center">
          <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full px-6">
            <a href="/sign-in">Login</a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-gray-800 hover:text-gray-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMenuOpen(false)
                }}
              >
                Features
              </a>
              <a 
                href="#about" 
                className="text-gray-800 hover:text-gray-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMenuOpen(false)
                }}
              >
                Meet Our Team
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button asChild variant="outline" className="justify-start rounded-full">
                  <a href="/sign-in">Login</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

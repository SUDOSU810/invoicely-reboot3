"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import GlassSurface from "@/components/ui/glass-surface"
import InvoicelyLogo from "@/components/ui/invoicely-logo"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
      <GlassSurface
        width="100%"
        height={80}
        borderRadius={20}
        brightness={95}
        opacity={0.8}
        blur={12}
        className="backdrop-blur-md bg-white/10 border border-white/20"
      >
        <div className="flex items-center justify-between px-8 py-4 w-full">
          <InvoicelyLogo 
            width={120} 
            height={40}
            className="bg-transparent"
            color="white"
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#templates" className="text-foreground/80 hover:text-foreground transition-colors">
              Templates
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#demo" className="text-foreground/80 hover:text-foreground transition-colors">
              Demo
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" className="text-foreground/80 hover:text-foreground">
              <a href="/sign-in">Sign In</a>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/sign-in">Try for Free</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#templates" className="text-foreground/80 hover:text-foreground transition-colors">
                Templates
              </a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#demo" className="text-foreground/80 hover:text-foreground transition-colors">
                Demo
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                <Button asChild variant="ghost" className="justify-start">
                  <a href="/sign-in">Sign In</a>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/sign-in">Try for Free</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </GlassSurface>
    </nav>
  )
}

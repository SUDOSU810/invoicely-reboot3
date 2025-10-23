"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import GlassSurface from "@/components/ui/glass-surface"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          {/* Announcement Badge */}
          <div className="inline-flex items-center mb-8">
            <GlassSurface
              width={300}
              height={40}
              borderRadius={20}
              brightness={95}
              opacity={0.8}
              className="backdrop-blur-md bg-white/10 border border-white/20"
            >
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-sm font-medium text-white">New: AI-Powered Templates</span>
                <ArrowRight className="h-3 w-3 text-blue-400" />
              </div>
            </GlassSurface>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance mb-8">
            <span className="bg-gradient-to-r from-white via-white to-blue-300 bg-clip-text text-transparent">
              Professional invoicing
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              made simple
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto mb-12 text-balance leading-relaxed">
            Create, send, and track professional invoices in minutes. Join over 50,000 businesses who trust Invoicely
            for their billing needs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <a href="/sign-in">Start Free Trial</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-2 bg-transparent border-blue-300 text-blue-100 hover:bg-blue-600/20"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-blue-200/60 mb-8">Trusted by 50,000+ businesses worldwide</p>
        </div>
      </div>
    </section>
  )
}

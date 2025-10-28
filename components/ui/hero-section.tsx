"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import GlassSurface from "@/components/ui/glass-surface"
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          {/* Enhanced Creative Announcement Bar */}
          <div className="inline-flex items-center mb-8 group cursor-pointer">
            <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 animate-pulse"></div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute top-1 left-4 w-1 h-1 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-3 right-8 w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-2 left-12 w-1 h-1 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Main content */}
              <div className="relative flex items-center space-x-3 px-6 py-3">
                {/* Animated status indicator */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400 animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400 animate-ping opacity-30"></div>
                </div>
                
                {/* Morphing text */}
                <span className="text-sm font-semibold text-white tracking-wide" style={{ fontFamily: '"Special Gothic Expanded One", sans-serif' }}>
                  🚀 Try Our Invoice Services Now!!
                </span>
                
                {/* Animated arrow with glow */}
                <div className="relative">
                  <ArrowRight className="h-4 w-4 text-blue-300 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 h-4 w-4 bg-blue-400 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>
          </div>

          {/* Main Heading with Morphing Text Reveal */}
          <div className="mb-8">
            <div className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
              <MorphingTextReveal
                texts={[
                  "Create Professional Invoices",
                  "Track Payment Status",
                  "Manage Client Records",
                  "Generate Financial Reports",
                  "Automate Invoice Delivery"
                ]}
                className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                interval={4000}
                glitchOnHover={true}
              />
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-blue-100/90" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
              Effortlessly and keep everything organized in one place.
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100/80 max-w-4xl mx-auto mb-12 text-balance leading-relaxed">
            The complete invoicing solution for modern businesses. Start your free trial today.
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
          <p className="text-sm text-blue-200/60 mb-8"></p>
        </div>
      </div>
    </section>
  )
}

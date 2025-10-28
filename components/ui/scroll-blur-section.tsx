"use client"

import { useEffect, useState, useRef, ReactNode } from "react"

interface ScrollBlurSectionProps {
  children: ReactNode
  className?: string
  id?: string
  blurIntensity?: number
  blurDistance?: number
}

export default function ScrollBlurSection({ 
  children, 
  className = "", 
  id,
  blurIntensity = 8,
  blurDistance = 400
}: ScrollBlurSectionProps) {
  const [blur, setBlur] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height
      const windowHeight = window.innerHeight
      
      // Calculate the center of the viewport
      const viewportCenter = windowHeight / 2
      
      // Calculate the center of the section relative to viewport
      const sectionCenter = sectionTop + sectionHeight / 2
      
      // Calculate distance from viewport center to section center
      const distance = Math.abs(viewportCenter - sectionCenter)
      
      // Calculate blur amount based on distance
      let blurAmount = 0
      
      if (distance > blurDistance) {
        blurAmount = Math.min((distance - blurDistance) / 200 * blurIntensity, blurIntensity)
      }
      
      // Only blur when section is not in the center of viewport
      if (sectionTop > windowHeight || sectionTop + sectionHeight < 0) {
        blurAmount = blurIntensity
      }
      
      setBlur(blurAmount)
    }

    handleScroll() // Initial call
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [blurIntensity, blurDistance])

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        filter: `blur(${blur}px)`,
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'filter' // Optimize for animations
      }}
    >
      {children}
    </section>
  )
}
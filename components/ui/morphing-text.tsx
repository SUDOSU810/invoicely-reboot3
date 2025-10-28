"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MorphingTextProps {
  words: string[]
  staticText: string
  className?: string
  highlightClassName?: string
}

export default function MorphingText({ 
  words, 
  staticText, 
  className = "",
  highlightClassName = ""
}: MorphingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 3000) // 2.5s visible + 0.5s transition

    return () => clearInterval(interval)
  }, [words.length])

  // Find the longest word to set consistent width
  const longestWord = words.reduce((longest, word) => 
    word.length > longest.length ? word : longest, ""
  )

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-start leading-tight">
        {/* Morphing word container with fixed width to prevent layout shift */}
        <div className="relative inline-block mr-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWordIndex}
              initial={{ 
                opacity: 0, 
                y: 30, 
                filter: "blur(10px)",
                scale: 0.9
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                filter: "blur(0px)",
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                y: -30, 
                filter: "blur(10px)",
                scale: 0.9
              }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                opacity: { duration: 0.4 },
                filter: { duration: 0.5 },
                scale: { duration: 0.4 }
              }}
              className={`absolute top-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold ${highlightClassName}`}
              style={{ fontFamily: '"Cal Sans", sans-serif' }}
            >
              {words[currentWordIndex]}
            </motion.span>
          </AnimatePresence>
          {/* Invisible placeholder to maintain consistent layout */}
          <span className={`invisible font-bold ${highlightClassName}`} style={{ fontFamily: '"Cal Sans", sans-serif' }}>
            {longestWord}
          </span>
        </div>
        
        {/* Static text */}
        <span className="text-white font-bold flex-1" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
          {staticText}
        </span>
      </div>
    </div>
  )
}
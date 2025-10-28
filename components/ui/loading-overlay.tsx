"use client"

import { useEffect, useRef } from 'react'
import DotGridLoader from './dot-grid-loader'
import { LoadingErrorBoundary } from './loading-error-boundary'

interface LoadingOverlayProps {
  isVisible: boolean
  onComplete?: () => void
  timeout?: number // Timeout in milliseconds
}

export default function LoadingOverlay({
  isVisible,
  onComplete = () => {},
  timeout = 30000 // 30 seconds default timeout
}: LoadingOverlayProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  // ============================================================================
  // TIMEOUT PROTECTION
  // ============================================================================
  useEffect(() => {
    if (isVisible && timeout > 0) {
      // Set timeout to auto-hide loading overlay
      timeoutRef.current = setTimeout(() => {
        onComplete()
      }, timeout)
    } else if (timeoutRef.current) {
      // Clear timeout if overlay is hidden
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isVisible, timeout, onComplete])

  // ============================================================================
  // ACCESSIBILITY & FOCUS MANAGEMENT
  // ============================================================================
  useEffect(() => {
    if (isVisible) {
      // Prevent body scroll when overlay is visible
      document.body.style.overflow = 'hidden'
      
      // Set focus to overlay for screen readers
      const overlay = document.getElementById('loading-overlay')
      if (overlay) {
        overlay.focus()
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  // ============================================================================
  // KEYBOARD HANDLING
  // ============================================================================
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Trap focus within overlay (basic implementation)
      if (event.key === 'Tab') {
        event.preventDefault()
      }
      
      // Allow escape to close (optional - could be removed for PDF generation)
      if (event.key === 'Escape') {
        onComplete()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, onComplete])

  // ============================================================================
  // RENDER
  // ============================================================================
  if (!isVisible) return null

  return (
    <div
      id="loading-overlay"
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      aria-describedby="loading-description"
      tabIndex={-1}
    >
      {/* Background blur overlay - appears immediately */}
      <div 
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          backdropFilter: isVisible ? 'blur(12px)' : 'blur(0px)'
        }}
      />
      
      {/* Full screen dot animation */}
      <LoadingErrorBoundary>
        <DotGridLoader
          isVisible={isVisible}
          gridSize={18}
          cellShape="square"
          cellGap={28}
          cellColor="#3b82f6"
          blinkSpeed={1500}
          transitionDuration={800}
          fadeOutDuration={600}
          onComplete={onComplete}
        />
      </LoadingErrorBoundary>

      {/* Hidden accessibility labels */}
      <div className="sr-only">
        <h2 id="loading-title">Loading</h2>
        <p id="loading-description">Please wait while we process your request.</p>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect, useMemo, useCallback, CSSProperties } from 'react'

interface GridCell {
  id: string
  x: number
  y: number
  blinkDelay: number
  fadeDelay: number
  initialOpacity: number
}

interface DotGridLoaderProps {
  isVisible: boolean
  gridSize?: number
  cellShape?: "circle" | "square"
  cellGap?: number
  cellColor?: string
  blinkSpeed?: number
  transitionDuration?: number
  fadeOutDuration?: number
  onComplete?: () => void
  className?: string
}

type LoadingState = 'idle' | 'fadeIn' | 'loading' | 'transitioning' | 'fadeOut' | 'complete'

export default function DotGridLoader({
  isVisible,
  gridSize = 16,
  cellShape = "circle",
  cellGap = 8,
  cellColor = "hsl(var(--primary))",
  blinkSpeed = 1200,
  transitionDuration = 1000,
  fadeOutDuration = 800,
  onComplete = () => { },
  className = ""
}: DotGridLoaderProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [gridCells, setGridCells] = useState<GridCell[]>([])

  // ============================================================================
  // COMPUTED VALUES - Full screen dimensions
  // ============================================================================
  const dimensions = useMemo(() => {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 } // Default for SSR
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }, [])

  // ============================================================================
  // GRID GENERATION - Full coverage with proper scaling
  // ============================================================================
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const cellWithGap = gridSize + cellGap
    // Calculate grid to cover entire screen plus extra margin
    const margin = cellWithGap * 2
    const cols = Math.ceil((dimensions.width + margin * 2) / cellWithGap)
    const rows = Math.ceil((dimensions.height + margin * 2) / cellWithGap)
    const cells: GridCell[] = []

    // Start from negative margin to ensure full coverage
    const startX = -margin
    const startY = -margin

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          id: `${row}-${col}`,
          x: startX + col * cellWithGap,
          y: startY + row * cellWithGap,
          blinkDelay: Math.random() * blinkSpeed,
          fadeDelay: Math.random() * fadeOutDuration,
          initialOpacity: Math.random() * 0.7 + 0.3,
        })
      }
    }

    setGridCells(cells)
  }, [dimensions.width, dimensions.height, gridSize, cellGap, blinkSpeed, fadeOutDuration])

  // ============================================================================
  // LOADING STATE MANAGEMENT - Continuous animation until external completion
  // ============================================================================
  useEffect(() => {
    if (!isVisible) {
      setLoadingState('idle')
      return
    }

    let timeouts: NodeJS.Timeout[] = []

    // Fade in phase
    setLoadingState('fadeIn')

    // Loading phase - start the continuous animation after background blur
    timeouts.push(setTimeout(() => {
      setLoadingState('loading')
    }, 800))

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [isVisible])

  // Handle external completion trigger
  useEffect(() => {
    if (!isVisible && loadingState !== 'idle') {
      // Start fade out when isVisible becomes false
      setLoadingState('fadeOut')

      const fadeOutTimer = setTimeout(() => {
        setLoadingState('complete')
        onComplete()
      }, fadeOutDuration)

      return () => clearTimeout(fadeOutTimer)
    }
  }, [isVisible, loadingState, fadeOutDuration, onComplete])

  // ============================================================================
  // CELL STYLES - Smooth transitions with transparent blue tint
  // ============================================================================
  const getCellStyle = useCallback((cell: GridCell): CSSProperties => {
    const baseStyle: CSSProperties = {
      position: 'absolute',
      left: cell.x,
      top: cell.y,
      willChange: 'opacity, background-color, width, height, left, top, transform',
      borderRadius: cellShape === 'circle' ? '50%' : '4px'
    }

    if (loadingState === 'fadeIn') {
      return {
        ...baseStyle,
        backgroundColor: `${cellColor}80`,
        width: gridSize,
        height: gridSize,
        opacity: cell.initialOpacity * 0.9,
        transform: 'scale(1)',
        transition: `all 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        transitionDelay: `${cell.blinkDelay * 0.02}ms`
      }
    }

    if (loadingState === 'loading') {
      return {
        ...baseStyle,
        animation: `blink ${blinkSpeed}ms infinite ease-in-out`,
        animationDelay: `${cell.blinkDelay}ms`,
        animationFillMode: 'both',
        backgroundColor: `${cellColor}90`,
        width: gridSize,
        height: gridSize,
        opacity: 1,
        transform: 'scale(1)'
      }
    }

    if (loadingState === 'fadeOut') {
      return {
        ...baseStyle,
        backgroundColor: `${cellColor}60`,
        opacity: 0,
        transform: 'scale(0.9)',
        transition: `all ${fadeOutDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transitionDelay: `${cell.fadeDelay * 0.1}ms`,
        width: gridSize,
        height: gridSize
      }
    }

    return baseStyle
  }, [loadingState, blinkSpeed, cellColor, gridSize, cellGap, transitionDuration, fadeOutDuration, cellShape])

  // ============================================================================
  // RENDER - Full screen overlay with smooth animations
  // ============================================================================
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <style>{`
        @keyframes blink {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05);
          }
        }
        

        }
        
        .dot-grid-loader {
          z-index: 1000;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .dot-grid-loader * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Full screen grid container */}
      <div
        className="absolute inset-0 dot-grid-loader"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        {/* Grid Overlay */}
        {gridCells.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {gridCells.map(cell => (
              <div
                key={cell.id}
                style={getCellStyle(cell)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
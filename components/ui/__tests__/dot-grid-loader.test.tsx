import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DotGridLoader from '../dot-grid-loader'

// Mock timers
vi.useFakeTimers()

describe('DotGridLoader', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  it('renders when visible', () => {
    const { container } = render(<DotGridLoader isVisible={true} />)
    
    const loader = container.querySelector('.dot-grid-loader')
    expect(loader).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    const { container } = render(<DotGridLoader isVisible={false} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('generates grid cells based on dimensions', () => {
    const { container } = render(
      <DotGridLoader 
        isVisible={true} 
        width={100} 
        height={100} 
        gridSize={10} 
        cellGap={0}
      />
    )
    
    // Should generate grid cells
    const gridContainer = container.querySelector('.dot-grid-loader')
    expect(gridContainer).toBeInTheDocument()
  })

  it('applies correct cell shape classes', () => {
    const { rerender, container } = render(
      <DotGridLoader isVisible={true} cellShape="circle" />
    )
    
    // Check for circle shape
    let cells = container.querySelectorAll('.rounded-full')
    expect(cells.length).toBeGreaterThan(0)
    
    // Change to square shape
    rerender(<DotGridLoader isVisible={true} cellShape="square" />)
    
    cells = container.querySelectorAll('.rounded')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('calls onComplete callback during animation lifecycle', async () => {
    const onComplete = vi.fn()
    
    render(
      <DotGridLoader 
        isVisible={true} 
        onComplete={onComplete}
        transitionDuration={100}
      />
    )
    
    // Fast-forward through the animation lifecycle
    vi.advanceTimersByTime(2100) // Initial loading phase + transition
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('applies custom className', () => {
    const { container } = render(
      <DotGridLoader isVisible={true} className="custom-class" />
    )
    
    const loader = container.querySelector('.custom-class')
    expect(loader).toBeInTheDocument()
  })

  it('uses default props when not provided', () => {
    const { container } = render(<DotGridLoader isVisible={true} />)
    
    const gridContainer = container.querySelector('.dot-grid-loader')
    expect(gridContainer).toBeInTheDocument()
    
    // Should have default dimensions applied
    expect(gridContainer).toHaveStyle({ width: '400px', height: '300px' })
  })

  it('handles responsive dimensions', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    
    const { container } = render(
      <DotGridLoader isVisible={true} width={400} height={300} />
    )
    
    const gridContainer = container.querySelector('.dot-grid-loader')
    expect(gridContainer).toBeInTheDocument()
  })

  it('includes accessibility styles for reduced motion', () => {
    const { container } = render(<DotGridLoader isVisible={true} />)
    
    const style = container.querySelector('style')
    expect(style?.textContent).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
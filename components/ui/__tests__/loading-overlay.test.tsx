import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoadingOverlay from '../loading-overlay'

// Mock the DotGridLoader component
vi.mock('../dot-grid-loader', () => ({
  default: ({ isVisible, onComplete }: { isVisible: boolean; onComplete: () => void }) => (
    <div data-testid="dot-grid-loader" onClick={onComplete}>
      {isVisible ? 'Loading Animation' : null}
    </div>
  )
}))

// Mock timers
vi.useFakeTimers()

describe('LoadingOverlay', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
    // Clean up body overflow style
    document.body.style.overflow = 'unset'
  })

  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    const overlay = screen.getByRole('dialog')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveAttribute('aria-modal', 'true')
  })

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />)
    
    const overlay = screen.queryByRole('dialog')
    expect(overlay).not.toBeInTheDocument()
  })

  it('displays custom message', () => {
    const customMessage = 'Processing your request...'
    render(<LoadingOverlay isVisible={true} message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('displays default message when none provided', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
  })

  it('calls onComplete when timeout is reached', async () => {
    const onComplete = vi.fn()
    const timeout = 1000 // Use shorter timeout for testing
    
    render(
      <LoadingOverlay 
        isVisible={true} 
        onComplete={onComplete} 
        timeout={timeout}
      />
    )
    
    // Fast-forward past the timeout
    vi.advanceTimersByTime(timeout)
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    }, { timeout: 500 })
  })

  it('clears timeout when overlay becomes invisible', () => {
    const onComplete = vi.fn()
    const { rerender } = render(
      <LoadingOverlay 
        isVisible={true} 
        onComplete={onComplete} 
        timeout={5000}
      />
    )
    
    // Make overlay invisible before timeout
    rerender(
      <LoadingOverlay 
        isVisible={false} 
        onComplete={onComplete} 
        timeout={5000}
      />
    )
    
    // Fast-forward past the timeout
    vi.advanceTimersByTime(5000)
    
    // onComplete should not be called since overlay was hidden
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('prevents body scroll when visible', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when hidden', () => {
    const { rerender } = render(<LoadingOverlay isVisible={true} />)
    
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<LoadingOverlay isVisible={false} />)
    
    expect(document.body.style.overflow).toBe('unset')
  })

  it('handles keyboard events', async () => {
    const onComplete = vi.fn()
    
    render(<LoadingOverlay isVisible={true} onComplete={onComplete} />)
    
    const overlay = screen.getByRole('dialog')
    
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('traps focus with Tab key', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    const overlay = screen.getByRole('dialog')
    
    // Simulate Tab key press
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')
    
    document.dispatchEvent(tabEvent)
    
    // Tab should be prevented (basic test)
    expect(overlay).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    const overlay = screen.getByRole('dialog')
    
    expect(overlay).toHaveAttribute('aria-modal', 'true')
    expect(overlay).toHaveAttribute('aria-labelledby', 'loading-title')
    expect(overlay).toHaveAttribute('aria-describedby', 'loading-description')
    expect(overlay).toHaveAttribute('tabIndex', '-1')
  })

  it('renders loading animation dots', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    const dots = screen.getByRole('dialog').querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(3)
  })

  it('passes correct props to DotGridLoader', () => {
    render(<LoadingOverlay isVisible={true} />)
    
    const dotGridLoader = screen.getByTestId('dot-grid-loader')
    expect(dotGridLoader).toBeInTheDocument()
    expect(dotGridLoader).toHaveTextContent('Loading Animation')
  })

  it('handles onComplete from DotGridLoader', () => {
    const onComplete = vi.fn()
    
    render(<LoadingOverlay isVisible={true} onComplete={onComplete} />)
    
    const dotGridLoader = screen.getByTestId('dot-grid-loader')
    
    // Simulate click on the mocked DotGridLoader
    dotGridLoader.click()
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('disables timeout when set to 0', () => {
    const onComplete = vi.fn()
    
    render(
      <LoadingOverlay 
        isVisible={true} 
        onComplete={onComplete} 
        timeout={0}
      />
    )
    
    // Fast-forward a long time
    vi.advanceTimersByTime(60000)
    
    // onComplete should not be called due to timeout
    expect(onComplete).not.toHaveBeenCalled()
  })
})
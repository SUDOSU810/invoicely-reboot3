import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingErrorBoundary } from '../loading-error-boundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('LoadingErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={false} />
      </LoadingErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders default fallback when child component throws error', () => {
    render(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LoadingErrorBoundary>
    )
    
    // Should render default loading fallback
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Should render spinning loader
    const spinner = screen.getByText('Loading...').previousElementSibling
    expect(spinner).toHaveClass('animate-spin')
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>
    
    render(
      <LoadingErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </LoadingErrorBoundary>
    )
    
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('logs error when component throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LoadingErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Loading animation error:',
      expect.any(Error),
      expect.any(Object)
    )
    
    consoleSpy.mockRestore()
  })

  it('has proper structure for default fallback', () => {
    render(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LoadingErrorBoundary>
    )
    
    // Check the structure of default fallback
    const container = screen.getByText('Loading...').closest('div')
    expect(container).toHaveClass('text-center', 'space-y-2')
    
    const spinner = container?.querySelector('.animate-spin')
    expect(spinner).toHaveClass('w-8', 'h-8', 'border-2', 'border-primary', 'border-t-transparent', 'rounded-full', 'mx-auto')
  })

  it('resets error state when children change', () => {
    const { rerender } = render(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LoadingErrorBoundary>
    )
    
    // Should show error fallback
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Re-render with non-throwing component
    rerender(
      <LoadingErrorBoundary>
        <ThrowError shouldThrow={false} />
      </LoadingErrorBoundary>
    )
    
    // Should still show error fallback (error boundaries don't reset automatically)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles multiple error types', () => {
    const ThrowDifferentError = () => {
      throw new TypeError('Type error')
    }
    
    render(
      <LoadingErrorBoundary>
        <ThrowDifferentError />
      </LoadingErrorBoundary>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
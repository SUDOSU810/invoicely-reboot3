import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'

// Mock the invoice analytics hook
vi.mock('../../lib/hooks/useInvoiceAnalytics', () => ({
  useInvoiceAnalytics: () => ({
    analytics: {
      totalRevenue: 0,
      totalInvoices: 0,
      monthlyRevenue: 0,
      pendingAmount: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      draftAmount: 0,
      draftInvoices: 0,
    },
    isLoading: false,
    refreshAnalytics: vi.fn(),
  }),
}))

// Mock the invoice service
vi.mock('../../lib/invoice-service', () => ({
  invoiceService: {
    saveInvoice: vi.fn().mockResolvedValue({ id: 'test-id', source: 'dynamodb' }),
    addPdfUrl: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock fetch for PDF generation
global.fetch = vi.fn()

// Mock DOM methods for PDF download
Object.defineProperty(document, 'createElement', {
  value: vi.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn(),
      }
    }
    return document.createElement(tagName)
  }),
})

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
})

// Mock window.alert
global.alert = vi.fn()

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
}

describe('PDF Loading Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage
    localStorage.clear()
  })

  it('shows loading overlay when generating PDF', async () => {
    const user = userEvent.setup()
    
    // Mock successful PDF generation
    ;(global.fetch as any).mockResolvedValueOnce({
      status: 201,
      json: () => Promise.resolve({ pdfUrl: 'https://example.com/test.pdf' }),
    })
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Click Export PDF button
    const exportButton = screen.getByRole('button', { name: /export pdf/i })
    await user.click(exportButton)
    
    // Should show loading overlay
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
    
    // Wait for PDF generation to complete
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('disables PDF button while generating', async () => {
    const user = userEvent.setup()
    
    // Mock slow PDF generation
    ;(global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          status: 201,
          json: () => Promise.resolve({ pdfUrl: 'https://example.com/test.pdf' }),
        }), 1000)
      )
    )
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Click Export PDF button
    const exportButton = screen.getByRole('button', { name: /export pdf/i })
    await user.click(exportButton)
    
    // Button should be disabled and show "Generating..."
    expect(exportButton).toBeDisabled()
    expect(exportButton).toHaveTextContent('Generating...')
    
    // Wait for completion
    await waitFor(() => {
      expect(exportButton).not.toBeDisabled()
      expect(exportButton).toHaveTextContent('Export PDF')
    }, { timeout: 5000 })
  })

  it('hides loading overlay on PDF generation error', async () => {
    const user = userEvent.setup()
    
    // Mock failed PDF generation
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Click Export PDF button
    const exportButton = screen.getByRole('button', { name: /export pdf/i })
    await user.click(exportButton)
    
    // Should show loading overlay initially
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Wait for error handling
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Should show error alert
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Error:'))
  })

  it('prevents multiple simultaneous PDF generations', async () => {
    const user = userEvent.setup()
    
    // Mock slow PDF generation
    ;(global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          status: 201,
          json: () => Promise.resolve({ pdfUrl: 'https://example.com/test.pdf' }),
        }), 1000)
      )
    )
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Click Export PDF button multiple times quickly
    const exportButton = screen.getByRole('button', { name: /export pdf/i })
    await user.click(exportButton)
    await user.click(exportButton)
    await user.click(exportButton)
    
    // Should only make one fetch call
    expect(global.fetch).toHaveBeenCalledTimes(1)
    
    // Wait for completion
    await waitFor(() => {
      expect(exportButton).not.toBeDisabled()
    }, { timeout: 5000 })
  })

  it('works in preview mode as well', async () => {
    const user = userEvent.setup()
    
    // Mock successful PDF generation
    ;(global.fetch as any).mockResolvedValueOnce({
      status: 201,
      json: () => Promise.resolve({ pdfUrl: 'https://example.com/test.pdf' }),
    })
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Enter preview mode
    const previewButton = screen.getByRole('button', { name: /preview/i })
    await user.click(previewButton)
    
    // Should be in preview mode
    expect(screen.getByText('Close Preview')).toBeInTheDocument()
    
    // Click Generate PDF in preview mode
    const generateButton = screen.getByRole('button', { name: /generate pdf/i })
    await user.click(generateButton)
    
    // Should show loading overlay
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles timeout correctly', async () => {
    const user = userEvent.setup()
    vi.useFakeTimers()
    
    // Mock very slow PDF generation (never resolves)
    ;(global.fetch as any).mockImplementationOnce(() => new Promise(() => {}))
    
    renderHomePage()
    
    // Fill in required business name
    const businessNameInput = screen.getByLabelText(/business name/i)
    await user.type(businessNameInput, 'Test Business')
    
    // Click Export PDF button
    const exportButton = screen.getByRole('button', { name: /export pdf/i })
    await user.click(exportButton)
    
    // Should show loading overlay
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Fast-forward past timeout (30 seconds)
    vi.advanceTimersByTime(30000)
    
    // Loading overlay should be hidden due to timeout
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })
})
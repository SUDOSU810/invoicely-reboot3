// Pure Client-Side Invoice Service - No AWS Dependencies
import { localStorageService } from './local-storage-service';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: string;
  dueDate: string;
  items: number;
  description?: string;
  pdfUrl?: string;
  businessInfo?: any;
  clientInfo?: any;
  lineItems?: any[];
  createdAt: string;
  updatedAt: string;
  source?: 'localStorage' | 's3';
}

class PureClientService {
  private lambdaUrl: string;
  private s3BaseUrl: string;

  constructor() {
    // Use your existing Lambda URL
    this.lambdaUrl = (import.meta as any).env.VITE_LAMBDA_URL || '';
    this.s3BaseUrl = (import.meta as any).env.VITE_S3_PUBLIC_URL || '';
  }

  // Get current user ID from Cognito
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      return user.userId || user.username;
    } catch (error) {
      console.log('No authenticated user found');
      return null;
    }
  }

  // Save invoice to localStorage and try to generate PDF
  async saveInvoice(invoiceData: any): Promise<InvoiceRecord> {
    console.log('🔄 Saving invoice to localStorage...');
    
    // Always save to localStorage first
    const savedInvoice = await localStorageService.saveInvoice(invoiceData);
    savedInvoice.source = 'localStorage';
    
    // Try to generate PDF in background (don't wait for it)
    this.generatePdfInBackground(invoiceData, savedInvoice.id);
    
    console.log('✅ Invoice saved to localStorage successfully');
    return savedInvoice;
  }

  // Generate PDF in background without blocking
  private async generatePdfInBackground(invoiceData: any, invoiceId: string): Promise<void> {
    if (!this.lambdaUrl) {
      console.log('No Lambda URL configured, skipping PDF generation');
      return;
    }

    try {
      console.log('🔄 Attempting to generate PDF in background...');
      
      const response = await fetch(this.lambdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // If PDF was generated, update localStorage with the URL
        if (result.pdfUrl) {
          localStorageService.addPdfUrl(invoiceId, result.pdfUrl);
          console.log('✅ PDF generated and URL saved to localStorage');
        }
      } else {
        console.warn('⚠️ PDF generation failed, but invoice is saved locally');
      }
    } catch (error) {
      console.warn('⚠️ PDF generation failed, but invoice is saved locally:', error);
    }
  }

  // Get all invoices from localStorage
  async getAllInvoices(): Promise<InvoiceRecord[]> {
    console.log('🔄 Fetching invoices from localStorage...');
    
    try {
      const localInvoices = localStorageService.getAllInvoices();
      
      // Enhance with potential S3 PDF URLs
      const enhancedInvoices = await Promise.all(
        localInvoices.map(async (invoice) => {
          // Try to construct S3 URL if we have the pattern
          if (!invoice.pdfUrl && this.s3BaseUrl) {
            const userId = await this.getCurrentUserId() || 'anonymous';
            const potentialS3Url = `${this.s3BaseUrl}/invoices/${userId}_${invoice.invoiceNumber}.pdf`;
            
            // Test if the PDF exists (don't wait long)
            try {
              const testResponse = await Promise.race([
                fetch(potentialS3Url, { method: 'HEAD' }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
              ]);
              
              if ((testResponse as Response).ok) {
                invoice.pdfUrl = potentialS3Url;
                invoice.source = 's3';
                // Update localStorage with found URL
                localStorageService.addPdfUrl(invoice.id, potentialS3Url);
              }
            } catch (error) {
              // PDF doesn't exist in S3, that's fine
            }
          }
          
          return invoice;
        })
      );
      
      console.log(`📦 Loaded ${enhancedInvoices.length} invoices from localStorage`);
      return enhancedInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  // Get single invoice
  async getInvoice(id: string): Promise<InvoiceRecord | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find(inv => inv.id === id) || null;
  }

  // Get PDF URL
  async getPdfUrl(id: string): Promise<string | null> {
    const invoice = await this.getInvoice(id);
    return invoice?.pdfUrl || null;
  }

  // Update invoice status
  async updateInvoiceStatus(id: string, status: InvoiceRecord['status']): Promise<void> {
    localStorageService.updateInvoiceStatus(id, status);
    console.log('📦 Status updated in localStorage');
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    localStorageService.deleteInvoice(id);
    console.log('📦 Invoice deleted from localStorage');
  }

  // Add PDF URL
  async addPdfUrl(id: string, pdfUrl: string): Promise<void> {
    localStorageService.addPdfUrl(id, pdfUrl);
    console.log('📦 PDF URL added to localStorage');
  }

  // Get service status
  async getServiceStatus(): Promise<{
    localStorage: boolean;
    localCount: number;
    pdfGeneration: boolean;
  }> {
    let localCount = 0;

    try {
      localCount = localStorageService.getAllInvoices().length;
    } catch (error) {
      // Ignore error
    }

    return {
      localStorage: true,
      localCount,
      pdfGeneration: !!this.lambdaUrl
    };
  }
}

export const pureClientService = new PureClientService();
export default PureClientService;
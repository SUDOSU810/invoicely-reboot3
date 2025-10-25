// Pure Client-Side Invoice Service - No AWS Dependencies
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
  pdfKey?: string; // S3 key for PDF
}

class S3InvoiceService {
  private bucketBaseUrl: string;
  private lambdaUrl: string;

  constructor() {
    // Use public S3 URLs instead of signed URLs
    this.bucketBaseUrl = (import.meta as any).env.VITE_S3_PUBLIC_URL || 'https://your-bucket.s3.amazonaws.com';
    this.lambdaUrl = (import.meta as any).env.VITE_LAMBDA_URL || 'https://your-lambda-url.amazonaws.com/dev/generate-invoice';
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

  // Fetch invoice list from Lambda endpoint (no AWS SDK needed)
  async getAllInvoices(userId?: string): Promise<InvoiceRecord[]> {
    console.log("getAllInvoices called (Lambda API)");
    
    const currentUserId = userId || await this.getCurrentUserId() || 'anonymous';
    
    try {
      // Call Lambda function to get invoice list
      const response = await fetch(`${this.lambdaUrl}/list-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const invoices = data.invoices || [];
      
      console.log(`Found ${invoices.length} invoices from Lambda`);
      
      // Transform to InvoiceRecord format and add public PDF URLs
      return invoices.map((metadata: any) => {
        const pdfUrl = this.generatePublicPdfUrl(metadata.userId, metadata.invoiceId);
        
        return {
          id: metadata.invoiceId,
          invoiceNumber: metadata.invoiceNumber,
          clientName: metadata.clientInfo?.name || '',
          clientEmail: metadata.clientInfo?.email,
          amount: metadata.total || 0,
          status: metadata.status || 'pending',
          date: metadata.date,
          dueDate: metadata.dueDate,
          items: metadata.lineItems?.length || 0,
          description: metadata.lineItems?.map((item: any) => item.description).join(', '),
          businessInfo: metadata.businessInfo,
          clientInfo: metadata.clientInfo,
          lineItems: metadata.lineItems,
          createdAt: metadata.createdAt,
          updatedAt: metadata.updatedAt || metadata.createdAt,
          pdfUrl,
          pdfKey: `invoices/${metadata.userId}_${metadata.invoiceId}.pdf`
        } as InvoiceRecord;
      }).sort((a: InvoiceRecord, b: InvoiceRecord) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
    } catch (error) {
      console.error('Error fetching invoices from Lambda:', error);
      return [];
    }
  }

  // Generate public PDF URL (no signing needed if bucket is public)
  private generatePublicPdfUrl(userId: string, invoiceId: string): string {
    return `${this.bucketBaseUrl}/invoices/${userId}_${invoiceId}.pdf`;
  }

  // Get single invoice by ID
  async getInvoice(id: string): Promise<InvoiceRecord | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find(inv => inv.id === id) || null;
  }

  // Get PDF URL (public URL, no signing needed)
  async getPdfUrl(id: string): Promise<string | null> {
    try {
      const invoice = await this.getInvoice(id);
      if (!invoice) {
        return null;
      }
      
      // Return public PDF URL
      return invoice.pdfUrl || null;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  }

  // Update/Delete operations fall back to localStorage
  async updateInvoiceStatus(_id: string, _status: InvoiceRecord['status']): Promise<void> {
    console.warn('S3 service: Status updates not implemented - using localStorage fallback');
    throw new Error('Status updates not supported in S3-only mode');
  }

  async deleteInvoice(_id: string): Promise<void> {
    console.warn('S3 service: Delete not implemented - using localStorage fallback');
    throw new Error('Delete not supported in S3-only mode');
  }
}

export const s3InvoiceService = new S3InvoiceService();
export default S3InvoiceService;
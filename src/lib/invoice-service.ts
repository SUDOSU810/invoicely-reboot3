// Professional Invoice Service - Pure Client-Side
import { pureClientService } from './pure-client-service';
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
  source?: 'localStorage' | 's3'; // Track data source
}

class InvoiceService {
  // Save invoice - Pure client-side with background PDF generation
  async saveInvoice(invoiceData: any): Promise<InvoiceRecord> {
    return await pureClientService.saveInvoice(invoiceData);
  }

  // Get all invoices - Pure client-side
  async getAllInvoices(): Promise<InvoiceRecord[]> {
    return await pureClientService.getAllInvoices();
  }

  // Get single invoice
  async getInvoice(id: string): Promise<InvoiceRecord | null> {
    return await pureClientService.getInvoice(id);
  }

  // Update invoice status
  async updateInvoiceStatus(id: string, status: InvoiceRecord['status']): Promise<void> {
    return await pureClientService.updateInvoiceStatus(id, status);
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    return await pureClientService.deleteInvoice(id);
  }

  // Add PDF URL
  async addPdfUrl(id: string, pdfUrl: string): Promise<void> {
    return await pureClientService.addPdfUrl(id, pdfUrl);
  }

  // Get PDF URL
  async getPdfUrl(id: string): Promise<string | null> {
    return await pureClientService.getPdfUrl(id);
  }

  // Get service status for debugging
  async getServiceStatus(): Promise<{
    localStorage: boolean;
    localCount: number;
    pdfGeneration: boolean;
  }> {
    return await pureClientService.getServiceStatus();
  }
}

export const invoiceService = new InvoiceService();
export default InvoiceService;
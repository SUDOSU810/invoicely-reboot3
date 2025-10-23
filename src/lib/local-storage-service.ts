// Local Storage Service - Works without AWS credentials
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
}

class LocalStorageService {
  private storageKey = 'invoices';

  // Save invoice to localStorage
  async saveInvoice(invoiceData: any): Promise<InvoiceRecord> {
    const invoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoice: InvoiceRecord = {
      id: invoiceId,
      invoiceNumber: invoiceData.invoiceNumber,
      clientName: invoiceData.clientInfo.name,
      clientEmail: invoiceData.clientInfo.email,
      amount: invoiceData.total,
      status: invoiceData.status || 'pending',
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      items: invoiceData.lineItems.length,
      description: invoiceData.lineItems.map((item: any) => item.description).join(', '),
      businessInfo: invoiceData.businessInfo,
      clientInfo: invoiceData.clientInfo,
      lineItems: invoiceData.lineItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingInvoices = this.getAllInvoices();
    existingInvoices.push(invoice);
    localStorage.setItem(this.storageKey, JSON.stringify(existingInvoices));
    
    return invoice;
  }

  // Get all invoices
  getAllInvoices(): InvoiceRecord[] {
    try {
      const invoices = localStorage.getItem(this.storageKey);
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Get invoice by ID
  getInvoice(id: string): InvoiceRecord | null {
    const invoices = this.getAllInvoices();
    return invoices.find(invoice => invoice.id === id) || null;
  }

  // Update invoice status
  updateInvoiceStatus(id: string, status: InvoiceRecord['status']): void {
    const invoices = this.getAllInvoices();
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id);
    
    if (invoiceIndex !== -1) {
      invoices[invoiceIndex].status = status;
      invoices[invoiceIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(invoices));
    }
  }

  // Delete invoice
  deleteInvoice(id: string): void {
    const invoices = this.getAllInvoices();
    const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredInvoices));
  }

  // Add PDF URL to invoice
  addPdfUrl(id: string, pdfUrl: string): void {
    const invoices = this.getAllInvoices();
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id);
    
    if (invoiceIndex !== -1) {
      invoices[invoiceIndex].pdfUrl = pdfUrl;
      invoices[invoiceIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(invoices));
    }
  }

  // Export all data (for backup)
  exportData(): string {
    return JSON.stringify(this.getAllInvoices(), null, 2);
  }

  // Import data (for restore)
  importData(jsonData: string): void {
    try {
      const invoices = JSON.parse(jsonData);
      localStorage.setItem(this.storageKey, JSON.stringify(invoices));
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const localStorageService = new LocalStorageService();
export default LocalStorageService;
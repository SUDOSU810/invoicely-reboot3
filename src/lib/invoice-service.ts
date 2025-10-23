// Professional Invoice Service - DynamoDB First with Graceful Fallback
import { dynamoDBService } from './dynamodb-service';
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
  source?: 'dynamodb' | 'localStorage'; // Track data source
}

class InvoiceService {
  private isDynamoDBAvailable = true;
  private lastConnectionCheck = 0;
  private connectionCheckInterval = 30000; // Check every 30 seconds

  // Test DynamoDB connectivity with timeout
  private async testDynamoDBConnection(): Promise<boolean> {
    try {
      // Set a timeout to avoid hanging when AWS Academy is off
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const testPromise = dynamoDBService.getAllInvoices();
      
      await Promise.race([testPromise, timeoutPromise]);
      this.isDynamoDBAvailable = true;
      console.log('✅ DynamoDB connection successful');
      return true;
    } catch (error) {
      console.warn('⚠️ DynamoDB unavailable (AWS Academy lab may be off):', error.message);
      this.isDynamoDBAvailable = false;
      return false;
    }
  }

  // Save invoice - Try DynamoDB first, fallback to localStorage
  async saveInvoice(invoiceData: any): Promise<InvoiceRecord> {
    console.log('🔄 Attempting to save invoice to DynamoDB...');
    
    try {
      // Try DynamoDB first
      const savedInvoice = await dynamoDBService.saveInvoice(invoiceData);
      savedInvoice.source = 'dynamodb';
      
      console.log('✅ Invoice saved to DynamoDB successfully');
      
      // Also save to localStorage as backup
      await localStorageService.saveInvoice(invoiceData);
      console.log('📦 Backup saved to localStorage');
      
      return savedInvoice;
      
    } catch (dynamoError) {
      console.warn('⚠️ DynamoDB save failed, using localStorage fallback');
      console.error('DynamoDB Error:', dynamoError.message);
      
      // Fallback to localStorage
      const savedInvoice = await localStorageService.saveInvoice(invoiceData);
      savedInvoice.source = 'localStorage';
      
      console.log('✅ Invoice saved to localStorage (DynamoDB unavailable)');
      return savedInvoice;
    }
  }

  // Get all invoices - Merge DynamoDB and localStorage data
  async getAllInvoices(): Promise<InvoiceRecord[]> {
    console.log('🔄 Fetching invoices from all sources...');
    
    let dynamoInvoices: InvoiceRecord[] = [];
    let localInvoices: InvoiceRecord[] = [];

    // Try to get DynamoDB invoices
    try {
      dynamoInvoices = await dynamoDBService.getAllInvoices();
      dynamoInvoices.forEach(invoice => invoice.source = 'dynamodb');
      console.log(`✅ Loaded ${dynamoInvoices.length} invoices from DynamoDB`);
    } catch (error) {
      console.warn('⚠️ Could not fetch from DynamoDB:', error.message);
    }

    // Always get localStorage invoices
    try {
      localInvoices = localStorageService.getAllInvoices();
      localInvoices.forEach(invoice => invoice.source = 'localStorage');
      console.log(`📦 Loaded ${localInvoices.length} invoices from localStorage`);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    // Merge and deduplicate (DynamoDB takes priority)
    const allInvoices = [...dynamoInvoices];
    const dynamoIds = new Set(dynamoInvoices.map(inv => inv.id));
    
    // Add localStorage invoices that aren't in DynamoDB
    localInvoices.forEach(localInv => {
      if (!dynamoIds.has(localInv.id)) {
        allInvoices.push(localInv);
      }
    });

    console.log(`📊 Total invoices: ${allInvoices.length} (${dynamoInvoices.length} from DynamoDB, ${localInvoices.filter(inv => !dynamoIds.has(inv.id)).length} from localStorage)`);
    
    return allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get single invoice
  async getInvoice(id: string): Promise<InvoiceRecord | null> {
    // Try DynamoDB first
    try {
      const invoice = await dynamoDBService.getInvoice(id);
      if (invoice) {
        invoice.source = 'dynamodb';
        return invoice;
      }
    } catch (error) {
      console.warn('DynamoDB getInvoice failed:', error.message);
    }

    // Fallback to localStorage
    const invoice = localStorageService.getInvoice(id);
    if (invoice) {
      invoice.source = 'localStorage';
    }
    return invoice;
  }

  // Update invoice status
  async updateInvoiceStatus(id: string, status: InvoiceRecord['status']): Promise<void> {
    let updated = false;

    // Try DynamoDB first
    try {
      await dynamoDBService.updateInvoiceStatus(id, status);
      console.log('✅ Status updated in DynamoDB');
      updated = true;
    } catch (error) {
      console.warn('DynamoDB update failed:', error.message);
    }

    // Always update localStorage
    try {
      localStorageService.updateInvoiceStatus(id, status);
      console.log('📦 Status updated in localStorage');
      updated = true;
    } catch (error) {
      console.error('localStorage update failed:', error);
    }

    if (!updated) {
      throw new Error('Failed to update invoice status in any storage');
    }
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    let deleted = false;

    // Try DynamoDB first
    try {
      await dynamoDBService.deleteInvoice(id);
      console.log('✅ Invoice deleted from DynamoDB');
      deleted = true;
    } catch (error) {
      console.warn('DynamoDB delete failed:', error.message);
    }

    // Always delete from localStorage
    try {
      localStorageService.deleteInvoice(id);
      console.log('📦 Invoice deleted from localStorage');
      deleted = true;
    } catch (error) {
      console.error('localStorage delete failed:', error);
    }

    if (!deleted) {
      throw new Error('Failed to delete invoice from any storage');
    }
  }

  // Add PDF URL
  async addPdfUrl(id: string, pdfUrl: string): Promise<void> {
    // Try DynamoDB first
    try {
      await dynamoDBService.addPdfUrl(id, pdfUrl);
      console.log('✅ PDF URL added to DynamoDB');
    } catch (error) {
      console.warn('DynamoDB PDF URL update failed:', error.message);
    }

    // Always update localStorage
    try {
      localStorageService.addPdfUrl(id, pdfUrl);
      console.log('📦 PDF URL added to localStorage');
    } catch (error) {
      console.error('localStorage PDF URL update failed:', error);
    }
  }

  // Get PDF URL with automatic refresh if expired
  async getPdfUrl(id: string): Promise<string | null> {
    try {
      // Try DynamoDB first
      const refreshedUrl = await dynamoDBService.refreshPdfUrl(id);
      if (refreshedUrl) {
        return refreshedUrl;
      }

      // If DynamoDB URL is expired, check localStorage
      const invoice = localStorageService.getInvoice(id);
      if (invoice?.pdfUrl) {
        // Test if localStorage URL is still valid
        try {
          const response = await fetch(invoice.pdfUrl, { method: 'HEAD' });
          if (response.ok) {
            return invoice.pdfUrl;
          }
        } catch (error) {
          console.log('localStorage PDF URL also expired');
        }
      }

      return null; // All URLs expired
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  }

  // Get service status for debugging
  async getServiceStatus(): Promise<{
    dynamodb: boolean;
    localStorage: boolean;
    dynamoCount: number;
    localCount: number;
  }> {
    const dynamoAvailable = await this.testDynamoDBConnection();
    
    let dynamoCount = 0;
    let localCount = 0;

    try {
      dynamoCount = (await dynamoDBService.getAllInvoices()).length;
    } catch (error) {
      // Ignore error
    }

    try {
      localCount = localStorageService.getAllInvoices().length;
    } catch (error) {
      // Ignore error
    }

    return {
      dynamodb: dynamoAvailable,
      localStorage: true,
      dynamoCount,
      localCount
    };
  }
}

export const invoiceService = new InvoiceService();
export default InvoiceService;
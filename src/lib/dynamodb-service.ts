// DynamoDB Service for Invoice Management
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  ScanCommand, 
  GetCommand,
  UpdateCommand,
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';

// Invoice type matching your existing interface
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

class DynamoDBService {
  private client: DynamoDBDocumentClient;
  private tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME || 'invoices';

  constructor() {
    // Initialize with environment variables (secure)
    const dynamoClient = new DynamoDBClient({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
        sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN || '',
      },
    });
    
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  // Get current user ID from Cognito
  private async getCurrentUserId(): Promise<string | null> {
    try {
      // Try to get current user from Cognito
      const { getCurrentUser } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      return user.userId || user.username;
    } catch (error) {
      console.log('No authenticated user found');
      return null;
    }
  }

  // Update credentials (for AWS Academy session refresh)
  updateCredentials(credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    region?: string;
  }) {
    const dynamoClient = new DynamoDBClient({
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });
    
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  // Save invoice to DynamoDB with user context
  async saveInvoice(invoiceData: any, userId?: string): Promise<InvoiceRecord> {
    console.log("saveInvoice called with data:", invoiceData);
    
    // Get user ID from Cognito or use provided userId
    const userIdentifier = userId || await this.getCurrentUserId() || 'anonymous';
    const invoiceId = `${userIdentifier}_invoice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log("Generated invoice ID:", invoiceId);
    
    const invoice: InvoiceRecord = {
      id: invoiceId,
      userId: userIdentifier, // Add user context
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

    console.log("Prepared invoice record:", invoice);

    const itemToSave = {
      ...invoice, // invoice already has id: invoiceId
    };

    console.log("Item to save to DynamoDB:", itemToSave);

    const command = new PutCommand({
      TableName: this.tableName,
      Item: itemToSave,
    });

    console.log("Sending command to DynamoDB...");
    await this.client.send(command);
    console.log("Successfully saved to DynamoDB");
    
    return invoice;
  }

  // Get all invoices for current user
  async getAllInvoices(userId?: string): Promise<InvoiceRecord[]> {
    console.log("getAllInvoices called");
    
    const currentUserId = userId || await this.getCurrentUserId();
    
    let command;
    if (currentUserId) {
      // Filter by user ID
      command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": currentUserId
        }
      });
      console.log("Scanning DynamoDB table for user:", currentUserId);
    } else {
      // Fallback: get all invoices (for backward compatibility)
      command = new ScanCommand({
        TableName: this.tableName,
      });
      console.log("Scanning DynamoDB table (no user filter)");
    }

    const response = await this.client.send(command);
    console.log("DynamoDB scan response:", response);
    
    const items = response.Items || [];
    console.log("Raw items from DynamoDB:", items);
    
    // Items are already in the correct format with 'id' as partition key
    const transformedItems = items.map(item => {
      console.log("Processing item:", item);
      return item as InvoiceRecord;
    });
    
    console.log("Final transformed items:", transformedItems);
    return transformedItems;
  }

  // Get invoice by ID
  async getInvoice(id: string): Promise<InvoiceRecord | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id }, // Simple id key
    });

    const response = await this.client.send(command);
    return (response.Item as InvoiceRecord) || null;
  }

  // Update invoice status
  async updateInvoiceStatus(id: string, status: InvoiceRecord['status']): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await this.client.send(command);
  }

  // Add PDF URL to invoice
  async addPdfUrl(id: string, pdfUrl: string): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET pdfUrl = :pdfUrl, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':pdfUrl': pdfUrl,
        ':updatedAt': new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  // Check if PDF URL is expired and regenerate if needed
  async refreshPdfUrl(invoiceId: string): Promise<string | null> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice?.pdfUrl) {
        return null;
      }

      // Check if URL is expired by trying to fetch it
      try {
        const response = await fetch(invoice.pdfUrl, { method: 'HEAD' });
        if (response.ok) {
          return invoice.pdfUrl; // URL is still valid
        }
      } catch (error) {
        console.log('PDF URL appears to be expired, will regenerate');
      }

      // URL is expired, regenerate it by calling Lambda function
      // This is a simpler approach than trying to recreate S3 signed URLs client-side
      return null; // Return null to indicate PDF needs to be regenerated
    } catch (error) {
      console.error('Error checking PDF URL:', error);
      return null;
    }
  }
}

export const dynamoDBService = new DynamoDBService();
export default DynamoDBService;
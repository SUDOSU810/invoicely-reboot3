// Script to create a new DynamoDB table with proper structure
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    // AWS SDK will automatically use credentials from:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
    // 2. AWS credentials file (~/.aws/credentials)
    // 3. IAM roles (if running on EC2/Lambda)
    // 4. AWS CLI configuration
});

async function createInvoicesTable() {
    try {
        console.log('Creating new invoices table...');

        const command = new CreateTableCommand({
            TableName: 'invoices',
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH' // Partition key
                }
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S' // String
                }
            ],
            BillingMode: 'PAY_PER_REQUEST' // On-demand billing
        });

        const response = await client.send(command);
        console.log('✅ Table created successfully!');
        console.log('Table ARN:', response.TableDescription?.TableArn);
        console.log('Table Status:', response.TableDescription?.TableStatus);

    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log('✅ Table already exists!');
        } else {
            console.error('❌ Error creating table:', error.message);
        }
    }
}

createInvoicesTable();
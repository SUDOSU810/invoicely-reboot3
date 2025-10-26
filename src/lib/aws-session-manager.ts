// AWS Academy Session Manager
import { dynamoDBService } from './dynamodb-service';

export interface AWSCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    region?: string;
}

class AWSSessionManager {
    private sessionExpiryTime: number | null = null;

    // Update credentials when AWS Academy session is refreshed
    updateCredentials(credentials: AWSCredentials) {
        console.log('🔄 Updating AWS credentials...');

        // Update DynamoDB service with new credentials
        dynamoDBService.updateCredentials(credentials);

        // Set expiry time (AWS Academy sessions last ~4 hours)
        this.sessionExpiryTime = Date.now() + (4 * 60 * 60 * 1000); // 4 hours

        // Store in localStorage for persistence across page reloads
        localStorage.setItem('aws-session-expiry', this.sessionExpiryTime.toString());

        console.log('✅ AWS credentials updated successfully');
        return true;
    }

    // Check if session is expired or expiring soon
    checkSessionStatus(): {
        isExpired: boolean;
        isExpiringSoon: boolean;
        timeRemaining: number;
        message: string;
    } {
        const storedExpiry = localStorage.getItem('aws-session-expiry');
        const expiryTime = this.sessionExpiryTime || (storedExpiry ? parseInt(storedExpiry) : null);

        if (!expiryTime) {
            return {
                isExpired: true,
                isExpiringSoon: false,
                timeRemaining: 0,
                message: 'No AWS session found'
            };
        }

        const now = Date.now();
        const timeRemaining = expiryTime - now;
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        const isExpired = timeRemaining <= 0;
        const isExpiringSoon = timeRemaining <= (30 * 60 * 1000); // 30 minutes

        let message = '';
        if (isExpired) {
            message = 'AWS session expired. Using local storage only.';
        } else if (isExpiringSoon) {
            message = `AWS session expires in ${minutesRemaining} minutes. Consider refreshing.`;
        } else {
            message = `AWS session active. ${hoursRemaining}h ${minutesRemaining}m remaining.`;
        }

        return {
            isExpired,
            isExpiringSoon,
            timeRemaining,
            message
        };
    }

    // Show session refresh instructions
    showRefreshInstructions() {
        const instructions = `
🔄 AWS Academy Session Refresh Instructions:

1. Go to AWS Academy Learner Lab
2. Click "Start Lab" (if stopped)
3. Click "AWS Details" 
4. Copy the new credentials:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY  
   - AWS_SESSION_TOKEN
5. Use the "Update AWS Credentials" button in Settings

⚠️ Until refreshed, the app will use local storage only.
✅ All functionality still works, just no cloud sync.
    `;

        alert(instructions);
    }

    // Get credentials from AWS Academy format
    parseAWSAcademyCredentials(credentialsText: string): AWSCredentials | null {
        try {
            const lines = credentialsText.split('\n');
            const credentials: Partial<AWSCredentials> = {};

            for (const line of lines) {
                if (line.includes('AWS_ACCESS_KEY_ID=')) {
                    credentials.accessKeyId = line.split('=')[1]?.trim();
                } else if (line.includes('AWS_SECRET_ACCESS_KEY=')) {
                    credentials.secretAccessKey = line.split('=')[1]?.trim();
                } else if (line.includes('AWS_SESSION_TOKEN=')) {
                    credentials.sessionToken = line.split('=')[1]?.trim();
                }
            }

            if (credentials.accessKeyId && credentials.secretAccessKey && credentials.sessionToken) {
                return {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    sessionToken: credentials.sessionToken,
                    region: 'us-east-1'
                };
            }

            return null;
        } catch (error) {
            console.error('Error parsing credentials:', error);
            return null;
        }
    }
}

export const awsSessionManager = new AWSSessionManager();
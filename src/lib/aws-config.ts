// AWS Configuration for Academy Account
import { Amplify } from 'aws-amplify';

// You'll replace these with your AWS Academy credentials
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_7wc3BwnrT", // Keep existing Cognito config
      userPoolClientId: "e3tupt3l8ch25vt211chocm7q",
      loginWith: {
        username: true,
        email: true,
        phone: true,
      },
    },
  },
  // Add DynamoDB configuration
  aws_project_region: 'us-east-1', // Replace with your region
  aws_access_key_id: '', // Your AWS Academy Access Key
  aws_secret_access_key: '', // Your AWS Academy Secret Key
  aws_session_token: '', // Your AWS Academy Session Token
};

export const configureAWS = (credentials: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  region?: string;
}) => {
  // Update the config with your credentials
  const updatedConfig = {
    ...awsConfig,
    aws_access_key_id: credentials.accessKeyId,
    aws_secret_access_key: credentials.secretAccessKey,
    aws_session_token: credentials.sessionToken,
    aws_project_region: credentials.region || 'us-east-1',
  };
  
  Amplify.configure(updatedConfig);
};

export default awsConfig;
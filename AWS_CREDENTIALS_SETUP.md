# AWS Credentials Setup

## Overview
This project uses AWS services (DynamoDB, S3) and requires proper AWS credentials configuration. **Never commit AWS credentials to version control.**

## Setup Methods

### Method 1: Environment Variables (Recommended for Development)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your AWS credentials:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_SESSION_TOKEN=your_session_token_here  # Only needed for temporary credentials
   ```

### Method 2: AWS CLI Configuration
1. Install AWS CLI
2. Run `aws configure` and enter your credentials
3. Credentials will be stored in `~/.aws/credentials`

### Method 3: IAM Roles (Production)
- Use IAM roles when deploying to AWS services (EC2, Lambda, etc.)
- No hardcoded credentials needed

## For AWS Academy Users
If you're using AWS Academy:
1. Get your credentials from the AWS Academy Learner Lab
2. Use the temporary credentials (including session token)
3. Credentials expire after a few hours - you'll need to refresh them

## Security Best Practices
- ✅ Use environment variables or AWS CLI configuration
- ✅ Add `.env` files to `.gitignore`
- ✅ Use IAM roles in production
- ❌ Never commit credentials to Git
- ❌ Never hardcode credentials in source files

## Running the DynamoDB Setup Script
After configuring credentials, run:
```bash
node create-table.js
```

This will create the required DynamoDB table using your configured credentials.
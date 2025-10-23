# AWS Cognito Setup Guide

## Prerequisites
- AWS Account (AWS Academy or personal account)
- Basic knowledge of AWS Console

## Step 1: Create a Cognito User Pool

1. **Go to AWS Console** → Search for "Cognito"
2. Click **"Create user pool"**

### Configure Sign-in Experience
3. **Provider types**: Select **Email**
4. **Cognito user pool sign-in options**: Check **Email**
5. Click **Next**

### Configure Security Requirements
6. **Password policy**: Use Cognito defaults (or customize)
   - Minimum length: 8 characters
   - Require uppercase, lowercase, numbers
7. **Multi-factor authentication**: Select **No MFA** (for development)
8. **User account recovery**: Select **Email only**
9. Click **Next**

### Configure Sign-up Experience
10. **Self-service sign-up**: Enable
11. **Attribute verification**: Select **Send email message, verify email address**
12. **Required attributes**: Select **name** and **email**
13. Click **Next**

### Configure Message Delivery
14. **Email provider**: Select **Send email with Cognito** (for development)
    - For production, use **Send email with Amazon SES**
15. **FROM email address**: Use default
16. Click **Next**

### Integrate Your App
17. **User pool name**: Enter `invoice-generator-pool`
18. **App client name**: Enter `invoice-generator-app`
19. **Client secret**: Select **Don't generate a client secret**
20. **Authentication flows**: Check **ALLOW_USER_PASSWORD_AUTH**
21. Click **Next**

### Review and Create
22. Review all settings
23. Click **Create user pool**

## Step 2: Get Your Credentials

After creating the user pool:

1. **User Pool ID**: 
   - Go to your user pool
   - Copy the **User pool ID** (e.g., `us-east-1_XXXXXXXXX`)

2. **App Client ID**:
   - Go to **App integration** tab
   - Under **App clients**, click your app client
   - Copy the **Client ID** (e.g., `7839g8m6onaljulemloo1jbjn9`)

## Step 3: Configure Your App

Update `src/main.tsx` with your credentials:

```typescript
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "YOUR_USER_POOL_ID",        // Replace this
      userPoolClientId: "YOUR_APP_CLIENT_ID", // Replace this
      loginWith: {
        username: true,
        email: true,
        phone: false,
      },
    },
  },
})
```

## Step 4: Test the Authentication Flow

1. **Start the dev server**: `npm run dev`
2. **Create an account**:
   - Go to `/create-account`
   - Fill in your details
   - Submit the form
3. **Check your email** for the 6-digit verification code
4. **Verify OTP**:
   - You'll be redirected to `/verify-otp`
   - Enter the 6-digit code from your email
5. **Sign in**:
   - Go to `/sign-in`
   - Use your email and password
   - You should be redirected to `/home`

## Troubleshooting

### Email not received?
- Check your spam folder
- Verify email configuration in Cognito
- Check AWS Cognito quotas (50 emails/day for Cognito email)

### "User not confirmed" error?
- Go back to `/verify-otp`
- Request a new code
- Verify your email address

### Invalid credentials?
- Make sure you copied the correct User Pool ID and App Client ID
- Check that the region matches (us-east-1)

## For Production

1. **Use Amazon SES** for email delivery (higher quotas, better deliverability)
2. **Enable MFA** for better security
3. **Set up password policies** according to your requirements
4. **Configure domain** for hosted UI (optional)
5. **Add social providers** (Google, Facebook, etc.)

## Authentication Flow

```
Create Account → Email Verification (OTP) → Sign In → Home
```

1. User creates account with email/password
2. AWS Cognito sends 6-digit code to email
3. User enters code on OTP verification page
4. Account is confirmed
5. User can sign in
6. Session is maintained via AWS Cognito tokens

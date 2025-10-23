# Testing Guide - Invoice Generator with AWS Cognito

## What We've Implemented

### ✅ AWS Cognito Authentication
- Full signup/signin flow
- Email verification with 6-digit OTP
- Session management
- Error handling

### ✅ New Components & Pages
1. **OTP Verification Component** (`components/ui/otp-verify.tsx`)
   - 6-digit input boxes (changed from 4 as requested)
   - Beautiful animated gradient background
   - Auto-focus between inputs
   - Resend code functionality

2. **OTP Verification Page** (`src/pages/OTPVerifyPage.tsx`)
   - Integrated with AWS Cognito
   - Redirects from signup
   - Handles email confirmation

3. **Auth Hook** (`src/lib/hooks/useAuth.tsx`)
   - Context provider for authentication
   - Login, signup, confirm, logout functions
   - User state management

### ✅ Updated Pages
- **CreateAccountPage**: Now uses AWS Cognito signup
- **SignInPage**: Now uses AWS Cognito login
- **App.tsx**: Wrapped with AuthProvider, added OTP route

## Before Testing - Setup AWS Cognito

⚠️ **IMPORTANT**: You must set up AWS Cognito first!

Follow the guide in `AWS_COGNITO_SETUP.md` to:
1. Create a Cognito User Pool
2. Get your User Pool ID and App Client ID
3. Update `src/main.tsx` with your credentials

**Current Configuration** (in `src/main.tsx`):
```typescript
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_XXXXXXXXX",     // ⚠️ REPLACE THIS
      userPoolClientId: "XXXXXXXXXXXXXXXXXX", // ⚠️ REPLACE THIS
      loginWith: {
        username: true,
        email: true,
        phone: false,
      },
    },
  },
})
```

## Testing Locally

### Step 1: Start Dev Server
```bash
npm run dev
```

Server should start at `http://localhost:3000`

### Step 2: Test Signup Flow

1. **Navigate to Create Account**
   - Go to `http://localhost:3000/create-account`
   - Or click "Create Account" from sign-in page

2. **Fill Out the Form**
   - Full Name: `John Doe`
   - Email: Use a **real email you can access**
   - Password: Use a strong password (8+ chars, uppercase, lowercase, number)
   - Confirm Password: Same as above
   - Check "I agree to Terms"

3. **Submit**
   - Click "Create Account"
   - You should see a success toast
   - You'll be redirected to `/verify-otp`

4. **Check Your Email**
   - Look for an email from AWS Cognito
   - Subject: "Your verification code"
   - Copy the 6-digit code

5. **Verify OTP**
   - On the OTP page, enter the 6 digits
   - Click "Verify Email"
   - Success! You'll be redirected to `/sign-in`

### Step 3: Test Sign In Flow

1. **Navigate to Sign In**
   - Go to `http://localhost:3000/sign-in`

2. **Enter Credentials**
   - Email: The email you used to sign up
   - Password: Your password

3. **Submit**
   - Click "Sign In"
   - Success! You'll be redirected to `/home`

### Step 4: Test Navigation

Once signed in:
- Click **Home** in navbar → Invoice generator
- Click **History** in navbar → Invoice history table
- Click **Settings** in navbar → Settings page
- All should have the Aurora animated background

## Expected User Flow

```
┌─────────────────┐
│   Landing Page  │
│        /        │
└────────┬────────┘
         │
         ├──> Create Account (/create-account)
         │    └──> OTP Verification (/verify-otp)
         │         └──> Sign In (/sign-in)
         │
         └──> Sign In (/sign-in)
              └──> Home (/home) ✅ Authenticated
                   ├──> History (/history)
                   └──> Settings (/settings)
```

## Features to Test

### 🔐 Authentication Features
- [ ] Create account with email/password
- [ ] Receive 6-digit OTP via email
- [ ] Verify email with OTP code
- [ ] Sign in with verified credentials
- [ ] Error handling (wrong password, unverified email, etc.)
- [ ] Resend OTP code
- [ ] Toast notifications for all actions

### 🎨 OTP Page Features
- [ ] 6 input boxes (not 4)
- [ ] Animated gradient background
- [ ] Auto-focus to next input
- [ ] Backspace to previous input
- [ ] Verify button enabled only when all 6 digits entered
- [ ] Resend code button
- [ ] Loading state during verification

### 📱 Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile

## Common Testing Scenarios

### Scenario 1: Forgot to Verify Email
1. Sign up but don't verify OTP
2. Try to sign in
3. ✅ Should show error: "Please verify your email first"
4. ✅ Should redirect to OTP page

### Scenario 2: Wrong OTP Code
1. Sign up
2. Enter wrong code on OTP page
3. ✅ Should show error toast
4. ✅ Can try again

### Scenario 3: Resend OTP
1. Sign up
2. On OTP page, click "Resend"
3. ✅ Should show info toast
4. ✅ Check email for new code

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### AWS Cognito not configured
- Update `src/main.tsx` with your User Pool ID and Client ID
- Follow `AWS_COGNITO_SETUP.md`

### Email not received
- Check spam folder
- Verify email in Cognito console
- AWS Cognito free tier: 50 emails/day

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Next Steps After Testing

1. ✅ Test all features locally
2. ✅ Set up production Cognito pool
3. ✅ Configure SES for email (production)
4. ✅ Add MFA (optional)
5. ✅ Deploy to Netlify
6. ✅ Update environment variables for production

## Notes

- **OTP is 6 digits** (as requested, changed from 4)
- **Email verification is required** before sign in
- **Sessions persist** across page refreshes (via Cognito tokens)
- **All pages use the same theme** (dark mode with Aurora background)

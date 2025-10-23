# 🚀 Production Deployment Guide

## ⚠️ **Critical Issue: AWS Academy Credentials**

Your app currently uses **hardcoded AWS Academy credentials** that will **expire when you close the lab**. Here's how to handle this for production:

## 🔧 **Solutions for Different Hosting Platforms**

### **Option 1: Vercel (Recommended)**

1. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel --prod
   ```

2. **Add Environment Variables in Vercel Dashboard**:
   - Go to your Vercel project settings
   - Add these environment variables:
     ```
     VITE_AWS_REGION=us-east-1
     VITE_AWS_ACCESS_KEY_ID=your_new_access_key
     VITE_AWS_SECRET_ACCESS_KEY=your_new_secret_key
     VITE_AWS_SESSION_TOKEN=your_new_session_token
     ```

3. **Update Credentials When Lab Restarts**:
   - Start your AWS Academy lab
   - Get new credentials from "AWS Details"
   - Update the environment variables in Vercel
   - Redeploy

### **Option 2: Netlify**

1. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

2. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the same AWS credentials as above

### **Option 3: GitHub Pages + Actions**

1. **Add Secrets to GitHub Repository**:
   - Go to Settings → Secrets and Variables → Actions
   - Add AWS credentials as repository secrets

2. **Create GitHub Action** (`.github/workflows/deploy.yml`)

## 📋 **What You Need to Do Before Each Lab Session**

### **Step 1: Start AWS Academy Lab**
- Log into AWS Academy
- Start your lab session
- Wait for "Lab status: ready"

### **Step 2: Get New Credentials**
- Click "AWS Details" 
- Copy the new credentials:
  ```
  aws_access_key_id = AKIA...
  aws_secret_access_key = ...
  aws_session_token = IQoJb3...
  ```

### **Step 3: Update Your Hosting Platform**
- **Vercel**: Update environment variables in dashboard
- **Netlify**: Update environment variables in site settings
- **GitHub**: Update repository secrets

### **Step 4: Redeploy**
- Most platforms auto-redeploy when you update environment variables
- Or manually trigger a new deployment

## 🔄 **Alternative: Use AWS IAM User (If Available)**

If you have access to create IAM users (not typical in AWS Academy):

1. **Create IAM User** with DynamoDB permissions
2. **Generate Access Keys** (no session token needed)
3. **Use permanent credentials** (no expiration)

## 📊 **Current Status**

✅ **Working Now**: Local development with current credentials
❌ **Will Break**: When AWS Academy lab closes
🔧 **Solution**: Update credentials in hosting platform environment variables

## 🚨 **Important Notes**

- **AWS Academy labs typically run for 4 hours**
- **Credentials expire when lab stops**
- **DynamoDB table persists** (your data is safe)
- **Only credentials need updating**, not the code
- **PDF URLs in S3 may also expire** depending on your Lambda setup

## 🎯 **Recommended Workflow**

1. **Deploy once** with current credentials
2. **Test everything works** in production
3. **Document the credential update process**
4. **Update credentials** each time you restart the lab
5. **Consider migrating to personal AWS account** for permanent solution

Would you like me to help you set up deployment to Vercel or another platform?
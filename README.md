# 🧾 Invoicely - Professional Invoice Generator

A modern, full-featured invoice generation application built with React, TypeScript, and AWS services. Features a smart dual-storage system that gracefully handles AWS Academy lab limitations.

[![Built with React](https://img.shields.io/badge/Built%20with-React-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful dark theme with glass morphism effects
- 🔐 **Secure Authentication** - AWS Cognito integration with email verification
- 📄 **Professional PDFs** - Generate branded invoices with logo support
- 💾 **Smart Storage** - DynamoDB primary with localStorage fallback
- 📊 **Real-time Analytics** - Invoice statistics and revenue tracking
- 🌐 **Multi-currency** - Support for INR, USD, EUR, GBP, CAD, AUD
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🛡️ **AWS Academy Compatible** - Handles lab session limitations gracefully

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS Academy account (or personal AWS account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SUDOSU810/invoicely-reboot.git
   cd invoicely-reboot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your AWS credentials:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=your_access_key_here
   VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
   VITE_AWS_SESSION_TOKEN=your_session_token_here
   VITE_DYNAMODB_TABLE_NAME=invoices
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI components
- **Authentication**: AWS Cognito (Amplify)
- **Database**: AWS DynamoDB + localStorage fallback
- **PDF Generation**: AWS Lambda + PDFKit
- **Storage**: AWS S3
- **Deployment**: Vercel-ready

### Smart Dual-Storage System
- **Primary**: AWS DynamoDB for cloud storage
- **Fallback**: localStorage for offline functionality
- **Auto-detection**: Seamlessly switches based on AWS availability
- **Data merging**: Combines data from both sources when reconnecting

## 🔧 AWS Setup

### For AWS Academy Users
1. Start your AWS Academy lab session
2. Get credentials from "AWS Details" tab
3. Update `.env` file with new credentials
4. Restart the application

### For Personal AWS Accounts
1. Create IAM user with DynamoDB and S3 permissions
2. Generate access keys
3. Set up Cognito User Pool
4. Configure environment variables

## 📱 Usage

1. **Sign Up**: Create account with email verification
2. **Sign In**: Access your dashboard
3. **Create Invoice**: Fill in business and client details
4. **Add Items**: Include products/services with pricing
5. **Generate PDF**: Download professional invoice
6. **Track History**: View all invoices with analytics

## 🛡️ Security Features

- ✅ **Environment Variables**: AWS credentials never committed to git
- ✅ **Route Protection**: Authentication guards on all protected pages
- ✅ **User Isolation**: Invoice data separated by user
- ✅ **Session Management**: Automatic token refresh
- ✅ **Error Handling**: Graceful fallbacks for all scenarios

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **GitHub Pages**: Static hosting (localStorage only)
- **AWS Amplify**: Full AWS integration

## 📊 Project Structure

```
invoicely-reboot/
├── src/
│   ├── pages/           # Application pages
│   ├── components/      # Reusable components
│   ├── lib/            # Services and utilities
│   └── hooks/          # Custom React hooks
├── components/ui/       # UI component library
├── public/             # Static assets
└── lambda-function-updated.js  # AWS Lambda PDF generator
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Suhan Poojary** - Full Stack Developer & Project Lead
- **Sumit Jha** - Backend Developer & Database Architect  
- **Ved Motwani** - Frontend Developer & UI/UX Designer
- **Vaibhav Kankonkar** - DevOps Engineer & Quality Assurance

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/SUDOSU810/invoicely-reboot/issues) page
2. Review the documentation in the `/docs` folder
3. Create a new issue with detailed information

---

**Built with ❤️ by the Invoicely Team**

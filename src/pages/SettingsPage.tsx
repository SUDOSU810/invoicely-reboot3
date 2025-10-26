
import { useState, useEffect } from "react"
import { Building2, Palette, FileText, Plug, Save, Mail, Phone, Globe, MapPin, DollarSign, Cloud, RefreshCw, AlertTriangle } from "lucide-react"
import { awsSessionManager } from "../lib/aws-session-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface BusinessSettings {
  businessName: string
  email: string
  phone: string
  website: string
  address: string
  logoUrl: string
  theme: string
  primaryColor: string
  accentColor: string
  currency: string
  taxRate: string
  invoicePrefix: string
  startingNumber: string
}

const defaultSettings: BusinessSettings = {
  businessName: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  theme: "dark",
  primaryColor: "#000000",
  accentColor: "#3b82f6",
  currency: "inr",
  taxRate: "18",
  invoicePrefix: "INV-",
  startingNumber: "1"
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("business-settings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const updateSetting = (key: keyof BusinessSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem("business-settings", JSON.stringify(settings))
      
      // Also save to invoice draft for immediate use
      const currentDraft = localStorage.getItem("invoice-draft")
      if (currentDraft) {
        const draft = JSON.parse(currentDraft)
        draft.businessInfo = {
          ...draft.businessInfo,
          name: settings.businessName,
          email: settings.email,
          phone: settings.phone,
          website: settings.website,
          address: settings.address
        }
        draft.currency = settings.currency
        draft.taxRate = parseFloat(settings.taxRate)
        localStorage.setItem("invoice-draft", JSON.stringify(draft))
      }
      
      alert("✅ Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("❌ Error saving settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your business profile, branding, and invoice defaults.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
            <span className="sm:hidden">Brand</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoice Defaults</span>
            <span className="sm:hidden">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="aws" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">AWS Settings</span>
            <span className="sm:hidden">AWS</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
            <span className="sm:hidden">Apps</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-border/60 bg-background/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business-name" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Name
                  </Label>
                  <Input
                    id="business-name"
                    placeholder="Business name"
                    className="bg-background/50"
                    value={settings.businessName}
                    onChange={(e) => updateSetting("businessName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="bg-background/50"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone"
                    className="bg-background/50"
                    value={settings.phone}
                    onChange={(e) => updateSetting("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="Website"
                    className="bg-background/50"
                    value={settings.website}
                    onChange={(e) => updateSetting("website", e.target.value)}
                  />
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="Address"
                  className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={settings.address}
                  onChange={(e) => updateSetting("address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="mt-6 space-y-6">
          <Card className="border-border/60 bg-background/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Customize your invoice appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  placeholder="Logo URL"
                  className="bg-background/50"
                  value={settings.logoUrl}
                  onChange={(e) => updateSetting("logoUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your company logo image
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                    <SelectTrigger id="theme" className="bg-background/50">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      placeholder="Primary color (hex)"
                      className="bg-background/50 flex-1"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    />
                    <input
                      type="color"
                      className="h-9 w-16 rounded-md border border-input cursor-pointer"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      placeholder="Accent color (hex)"
                      className="bg-background/50 flex-1"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                    />
                    <input
                      type="color"
                      className="h-9 w-16 rounded-md border border-input cursor-pointer"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Defaults Tab */}
        <TabsContent value="invoice" className="mt-6 space-y-6">
          <Card className="border-border/60 bg-background/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Invoice Configuration</CardTitle>
              <CardDescription>
                Set default values for your invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                    <SelectTrigger id="currency" className="bg-background/50">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Default Tax</Label>
                  <Select value={settings.taxRate} onValueChange={(value) => updateSetting("taxRate", value)}>
                    <SelectTrigger id="tax" className="bg-background/50">
                      <SelectValue placeholder="Select tax rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prefix">Numbering Prefix</Label>
                  <Input
                    id="prefix"
                    placeholder="Numbering prefix (e.g., INV-)"
                    className="bg-background/50"
                    value={settings.invoicePrefix}
                    onChange={(e) => updateSetting("invoicePrefix", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: INV-0001, INV-0002
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starting-number">Starting Number</Label>
                  <Input
                    id="starting-number"
                    type="number"
                    placeholder="Starting number"
                    className="bg-background/50"
                    value={settings.startingNumber}
                    onChange={(e) => updateSetting("startingNumber", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The number to start counting from
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AWS Settings Tab */}
        <TabsContent value="aws" className="mt-6 space-y-6">
          <AWSCredentialsCard />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card className="border-border/60 bg-background/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Manage your integrations with third-party services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stripe Integration */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Stripe</h3>
                    <p className="text-sm text-muted-foreground">payments</p>
                  </div>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              {/* Email Integration */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gmail/Outlook</h3>
                    <p className="text-sm text-muted-foreground">email</p>
                  </div>
                </div>
                <Button variant="outline">Connect</Button>
              </div>

              {/* Accounting Integration */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">QuickBooks/Xero</h3>
                    <p className="text-sm text-muted-foreground">accounting</p>
                  </div>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2" onClick={saveSettings} disabled={isLoading}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

// AWS Credentials Management Component
function AWSCredentialsCard() {
  const [credentialsText, setCredentialsText] = useState('')
  const [sessionStatus, setSessionStatus] = useState({
    isExpired: true,
    isExpiringSoon: false,
    timeRemaining: 0,
    message: 'Checking AWS status...'
  })

  useEffect(() => {
    const checkStatus = () => {
      const status = awsSessionManager.checkSessionStatus()
      setSessionStatus(status)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleUpdateCredentials = () => {
    const credentials = awsSessionManager.parseAWSAcademyCredentials(credentialsText)
    
    if (credentials) {
      awsSessionManager.updateCredentials(credentials)
      setCredentialsText('')
      
      // Refresh status
      const newStatus = awsSessionManager.checkSessionStatus()
      setSessionStatus(newStatus)
      
      alert('✅ AWS credentials updated successfully!\n\nDynamoDB connection restored. The page will refresh to reconnect services.')
      
      // Refresh the page to reconnect services
      setTimeout(() => window.location.reload(), 1000)
    } else {
      alert('❌ Invalid credentials format. Please copy the complete AWS credentials from AWS Academy.')
    }
  }

  const getStatusBadge = () => {
    if (sessionStatus.isExpired) {
      return <Badge variant="destructive" className="gap-1"><Cloud className="h-3 w-3" />Offline</Badge>
    } else if (sessionStatus.isExpiringSoon) {
      return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Expiring Soon</Badge>
    } else {
      return <Badge variant="default" className="gap-1"><Cloud className="h-3 w-3" />Connected</Badge>
    }
  }

  return (
    <Card className="border-border/60 bg-background/30 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              AWS Academy Credentials
            </CardTitle>
            <CardDescription>
              Manage your AWS Academy session for DynamoDB access
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Information */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Current Status</h4>
          <p className="text-sm text-muted-foreground">{sessionStatus.message}</p>
          
          {sessionStatus.isExpired && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>⚠️ AWS Session Expired</strong><br />
                Your app is currently using localStorage only. Update credentials below to restore cloud functionality.
              </p>
            </div>
          )}
          
          {sessionStatus.isExpiringSoon && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>⏰ Session Expiring Soon</strong><br />
                Consider refreshing your AWS Academy credentials to avoid interruption.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">📋 How to Update Credentials:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-blue-600 dark:text-blue-400">
            <li>Go to <strong>AWS Academy Learner Lab</strong></li>
            <li>Click <strong>"Start Lab"</strong> (if stopped)</li>
            <li>Click <strong>"AWS Details"</strong></li>
            <li>Copy the <strong>entire credentials block</strong></li>
            <li>Paste it in the text area below</li>
            <li>Click <strong>"Update Credentials"</strong></li>
          </ol>
        </div>

        {/* Credentials Input */}
        <div className="space-y-2">
          <Label htmlFor="aws-credentials">AWS Academy Credentials</Label>
          <Textarea
            id="aws-credentials"
            placeholder="Paste your AWS Academy credentials here:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=..."
            value={credentialsText}
            onChange={(e) => setCredentialsText(e.target.value)}
            rows={8}
            className="font-mono text-sm bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Copy and paste the complete credentials block from AWS Academy
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => awsSessionManager.showRefreshInstructions()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Show Instructions
          </Button>
          
          <Button 
            onClick={handleUpdateCredentials}
            disabled={!credentialsText.trim()}
            className="gap-2"
          >
            <Cloud className="h-4 w-4" />
            Update Credentials
          </Button>
        </div>

        {/* What Works Without AWS */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">💡 What Works Without AWS:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="text-green-600 dark:text-green-400">
              ✅ Invoice creation<br />
              ✅ PDF generation<br />
              ✅ Local history<br />
              ✅ Settings management
            </div>
            <div className="text-red-600 dark:text-red-400">
              ❌ Cloud storage<br />
              ❌ Cross-device sync<br />
              ❌ DynamoDB access<br />
              ❌ Cloud backup
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { InvoiceDashboardStats } from "@/components/ui/invoice-stats"
import { useState, useRef, useCallback, useEffect } from "react"
import { useInvoiceAnalytics } from "../lib/hooks/useInvoiceAnalytics"
import { DollarSign, Clock, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Building2,
  Calendar,
  Hash,
  ImagePlus,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Send,
  Trash2,
  Upload,
  User,
  X,
  Eye,
} from "lucide-react"

// Types
interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface BusinessInfo {
  name: string
  address: string
  phone: string
  email: string
  logo?: string
}

interface ClientInfo {
  name: string
  address: string
  phone: string
  email: string
  gstVat?: string
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  businessInfo: BusinessInfo
  clientInfo: ClientInfo
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
  notes: string
  paymentTerms: string
  currency: string
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
}

// Utility functions
const generateInvoiceNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `INV-${year}${month}-${random}`
}

const formatCurrency = (amount: number, currency: string = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const calculateLineTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice
}

export default function HomePage() {
  // Analytics hook
  const { analytics, isLoading: analyticsLoading, refreshAnalytics } = useInvoiceAnalytics()

  // State management
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    businessInfo: {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
    },
    clientInfo: {
      name: "",
      address: "",
      phone: "",
      email: "",
      gstVat: "",
    },
    lineItems: [
      {
        id: "1",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 0,
    notes: "",
    paymentTerms: "Payment due within 30 days",
    currency: "INR",
    status: "pending",
  })

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Load settings and apply to invoice
  useEffect(() => {
    loadBusinessSettings()
  }, [])

  const loadBusinessSettings = () => {
    try {
      const savedSettings = localStorage.getItem("business-settings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setInvoiceData(prev => ({
          ...prev,
          businessInfo: {
            ...prev.businessInfo,
            name: settings.businessName || prev.businessInfo.name,
            email: settings.email || prev.businessInfo.email,
            phone: settings.phone || prev.businessInfo.phone,
            website: settings.website || prev.businessInfo.website,
            address: settings.address || prev.businessInfo.address,
          },
          currency: settings.currency || prev.currency,
          taxRate: parseFloat(settings.taxRate) || prev.taxRate,
        }))
      }
    } catch (error) {
      console.error("Error loading business settings:", error)
    }
  }

  // Update functions
  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value,
      },
    }))
  }

  const updateClientInfo = (field: keyof ClientInfo, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        [field]: value,
      },
    }))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = calculateLineTotal(
              field === "quantity" ? Number(value) : updatedItem.quantity,
              field === "unitPrice" ? Number(value) : updatedItem.unitPrice
            )
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setInvoiceData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }))
  }

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((item) => item.id !== id),
      }))
    }
  }

  // Logo upload handlers
  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (warn if > 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Large image detected. Compressing for PDF compatibility...')
      }
      // Create blob URL for preview
      const url = URL.createObjectURL(file)
      setLogoUrl(url)
      
      // Compress and convert to base64 for PDF generation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          // Set max dimensions (reduce size for Lambda)
          const maxWidth = 200
          const maxHeight = 200
          
          let { width, height } = img
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          // Set canvas size and draw compressed image
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
          console.log('✅ Logo compressed successfully')
          console.log('📊 Original size:', (file.size / 1024).toFixed(1), 'KB')
          console.log('📊 Compressed base64 length:', (compressedBase64.length / 1024).toFixed(1), 'KB')
          
          // Check if still too large (Lambda limit is ~6MB total request)
          if (compressedBase64.length > 500000) { // 500KB limit for image
            alert('⚠️ Image still too large after compression. Please use a smaller image.')
            return
          }
          
          updateBusinessInfo("logo", compressedBase64)
          console.log("🖼️ Logo set in invoice data:", compressedBase64.substring(0, 100) + '...')
        } catch (error) {
          console.error('Error processing image:', error)
          alert('❌ Error processing image. Please try a different image.')
        }
      }
      
      img.onerror = () => {
        alert('❌ Error loading image. Please try a different file.')
      }
      
      img.src = url
    }
  }

  const handleLogoRemove = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
    }
    setLogoUrl(null)
    updateBusinessInfo("logo", "")
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  // Calculate totals
  useEffect(() => {
    const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = (subtotal * invoiceData.discountRate) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * invoiceData.taxRate) / 100
    const total = taxableAmount + taxAmount

    setInvoiceData((prev) => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }))
  }, [invoiceData.lineItems, invoiceData.taxRate, invoiceData.discountRate])

  // Action handlers
  const handleSave = () => {
    localStorage.setItem("invoice-draft", JSON.stringify(invoiceData))
    alert("Invoice saved successfully!")
  }

  const handleGeneratePDF = async () => {
  try {
    const apiEndpoint = "https://oeegu8gbod.execute-api.us-east-1.amazonaws.com/default";

    // Prepare data for Lambda with logo in different formats
    const lambdaData = {
      ...invoiceData,
      // Try different logo field names that Lambda might expect
      logo: invoiceData.businessInfo.logo,
      companyLogo: invoiceData.businessInfo.logo,
      businessLogo: invoiceData.businessInfo.logo,
      // Add logo placeholder text if logo exists but Lambda doesn't support it
      logoPlaceholder: invoiceData.businessInfo.logo ? "⚠️ LOGO UPLOADED - PDF generation needs Lambda update to display logo" : "",
      // Also ensure business info is properly structured
      businessInfo: {
        ...invoiceData.businessInfo,
        name: invoiceData.businessInfo.name || 'Your Business Name',
        // Add a text-based logo fallback
        logoText: invoiceData.businessInfo.logo ? `[${invoiceData.businessInfo.name || 'COMPANY'} LOGO]` : ""
      }
    };

    console.log("🚀 Sending to Lambda:", {
      hasLogo: !!lambdaData.logo,
      logoSize: lambdaData.logo ? `${(lambdaData.logo.length / 1024).toFixed(1)}KB` : '0KB',
      businessName: lambdaData.businessInfo.name
    });

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lambdaData)
    });

    const result = await response.json();

    if (response.status === 201 && result.pdfUrl) {
      // Save invoice using DynamoDB-first service
      try {
        console.log("💾 Saving invoice to database...");
        console.log("📄 Invoice data being sent:");
        console.log("Business Name:", invoiceData.businessInfo.name);
        console.log("Logo present:", !!invoiceData.businessInfo.logo);
        console.log("Logo type:", invoiceData.businessInfo.logo ? 
          (invoiceData.businessInfo.logo.startsWith('data:') ? 'base64' : 'other') : 'none');
        console.log("Logo size:", invoiceData.businessInfo.logo ? 
          `${(invoiceData.businessInfo.logo.length / 1024).toFixed(1)}KB` : '0KB');
        
        const { invoiceService } = await import("../lib/invoice-service");
        
        const savedInvoice = await invoiceService.saveInvoice(invoiceData);
        console.log("Invoice saved:", savedInvoice);
        
        // Add PDF URL to the saved invoice
        await invoiceService.addPdfUrl(savedInvoice.id, result.pdfUrl);
        console.log("PDF URL added to invoice");
        
        const source = savedInvoice.source === 'dynamodb' ? 'DynamoDB' : 'Local Storage';
        alert(`✅ Invoice saved to ${source} successfully!`);
        
        // Refresh analytics after saving
        refreshAnalytics();
      } catch (error) {
        console.error("Error saving invoice:", error);
        alert("❌ Error saving invoice: " + error.message);
      }

      // Automatically download the PDF to user's device
      const link = document.createElement("a");
      link.href = result.pdfUrl;
      link.download = "invoice.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show appropriate message based on logo presence
      if (invoiceData.businessInfo.logo) {
        alert("✅ PDF generated and downloaded!\n\n⚠️ Note: Logo is uploaded and saved but won't appear in PDF until AWS Lambda function is updated to process logo data.");
      } else {
        alert("✅ PDF generated, saved to database, and downloaded!");
      }
    } else {
      alert("Error generating PDF: " + (result.message || "Unknown error"));
    }
   } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    alert("Error: " + message)
  }
}


  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Load saved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem("invoice-draft")
      if (saved) {
        const parsed = JSON.parse(saved)
        setInvoiceData(parsed)
        if (parsed.businessInfo.logo) {
          // If it's a base64 string, use it directly for preview
          if (parsed.businessInfo.logo.startsWith('data:')) {
            setLogoUrl(parsed.businessInfo.logo)
          } else {
            // If it's a blob URL, it might be expired, so clear it
            setLogoUrl(null)
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }, [])

  // Preview mode render
  if (isPreviewMode) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={handlePreview}>
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
          <div className="flex gap-2">
            <Link to="/history">
              <Button variant="outline">
                View History
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline">
                Settings
              </Button>
            </Link>
            <Button variant="outline" onClick={handleGeneratePDF}>
              <Printer className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            <Button onClick={handleSave}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
              )}
              <div>
                <h1 className="text-2xl font-bold">{invoiceData.businessInfo.name || "Your Business"}</h1>
                <p className="text-muted-foreground">{invoiceData.businessInfo.address}</p>
                <p className="text-muted-foreground">{invoiceData.businessInfo.phone}</p>
                <p className="text-muted-foreground">{invoiceData.businessInfo.email}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
              <p className="text-lg font-semibold">{invoiceData.invoiceNumber}</p>
              <p className="text-muted-foreground">Date: {formatDate(invoiceData.date)}</p>
              <p className="text-muted-foreground">Due: {formatDate(invoiceData.dueDate)}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold">{invoiceData.clientInfo.name || "Client Name"}</p>
              <p>{invoiceData.clientInfo.address}</p>
              <p>{invoiceData.clientInfo.phone}</p>
              <p>{invoiceData.clientInfo.email}</p>
              {invoiceData.clientInfo.gstVat && (
                <p>GST/VAT: {invoiceData.clientInfo.gstVat}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.description || "-"}</td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-right py-3">
                      {formatCurrency(item.unitPrice, invoiceData.currency)}
                    </td>
                    <td className="text-right py-3">
                      {formatCurrency(item.total, invoiceData.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</span>
                </div>
                {invoiceData.discountRate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({invoiceData.discountRate}%):</span>
                    <span>-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({invoiceData.taxRate}%):</span>
                  <span>{formatCurrency(invoiceData.taxAmount, invoiceData.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoiceData.total, invoiceData.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Payment Terms */}
          {(invoiceData.notes || invoiceData.paymentTerms) && (
            <div className="space-y-4">
              {invoiceData.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{invoiceData.notes}</p>
                </div>
              )}
              {invoiceData.paymentTerms && (
                <div>
                  <h3 className="font-semibold mb-2">Payment Terms:</h3>
                  <p className="text-muted-foreground">{invoiceData.paymentTerms}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 space-y-8">
      {/* Stats Section */}
      <InvoiceDashboardStats 
        data={[
          {
            title: "Total Revenue",
            amount: `₹${analytics.totalRevenue.toLocaleString()}`,
            count: analytics.totalInvoices,
            icon: <DollarSign className="h-6 w-6" />,
            trend: {
              value: analytics.monthlyRevenue > 0 ? 12.5 : 0,
              isPositive: true
            }
          },
          {
            title: "Pending Amount",
            amount: `₹${analytics.pendingAmount.toLocaleString()}`,
            count: analytics.pendingInvoices,
            icon: <Clock className="h-6 w-6" />,
            trend: {
              value: analytics.overdueInvoices > 0 ? 5.2 : 0,
              isPositive: false
            }
          },
          {
            title: "Draft Invoices",
            amount: `₹${analytics.draftAmount.toLocaleString()}`,
            count: analytics.draftInvoices,
            icon: <FileText className="h-6 w-6" />,
            trend: {
              value: analytics.draftInvoices > 0 ? 8.1 : 0,
              isPositive: true
            }
          }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Generator</h1>
          <p className="text-muted-foreground mt-1">Create a professional invoice with client details, items, and totals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/history">
            <button className="rounded-md border border-input bg-input/30 hover:bg-input/50 px-4 py-2 text-sm transition-colors">View History</button>
          </Link>
          <Link to="/settings">
            <button className="rounded-md border border-input bg-input/30 hover:bg-input/50 px-4 py-2 text-sm transition-colors">Settings</button>
          </Link>
          <button onClick={handleSave} className="rounded-md border border-input bg-input/30 hover:bg-input/50 px-4 py-2 text-sm transition-colors">Save Draft</button>
          <button onClick={handlePreview} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm transition-colors flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Business Information Section */}
      <section className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Your company details for the invoice header.</p>
        </div>
        
        {/* Logo Upload */}
        <div className="mb-4">
          <Label>Business Logo {invoiceData.businessInfo.logo && '✅'}</Label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={logoInputRef}
            onChange={handleLogoChange}
          />
          {!logoUrl ? (
            <div
              onClick={handleLogoClick}
              className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted"
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload Logo</span>
            </div>
          ) : (
            <div className="relative h-32 w-32">
              <img
                src={logoUrl}
                alt="Business Logo"
                className="h-full w-full object-contain rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={handleLogoRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={invoiceData.businessInfo.name}
              onChange={(e) => updateBusinessInfo("name", e.target.value)}
              placeholder="Your Business Name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessEmail">Email</Label>
            <Input
              id="businessEmail"
              type="email"
              value={invoiceData.businessInfo.email}
              onChange={(e) => updateBusinessInfo("email", e.target.value)}
              placeholder="business@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessPhone">Phone</Label>
            <Input
              id="businessPhone"
              value={invoiceData.businessInfo.phone}
              onChange={(e) => updateBusinessInfo("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessAddress">Address</Label>
            <Textarea
              id="businessAddress"
              value={invoiceData.businessInfo.address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBusinessInfo("address", e.target.value)}
              placeholder="123 Business St, City, State, ZIP"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Client & Invoice Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Details
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Who you're billing. Used on the invoice header.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientName">Client name *</Label>
              <Input
                id="clientName"
                value={invoiceData.clientInfo.name}
                onChange={(e) => updateClientInfo("name", e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={invoiceData.clientInfo.email}
                onChange={(e) => updateClientInfo("email", e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={invoiceData.clientInfo.phone}
                onChange={(e) => updateClientInfo("phone", e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientGstVat">GST/VAT (optional)</Label>
              <Input
                id="clientGstVat"
                value={invoiceData.clientInfo.gstVat}
                onChange={(e) => updateClientInfo("gstVat", e.target.value)}
                placeholder="GST/VAT Number"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="clientAddress">Billing address</Label>
              <Textarea
                id="clientAddress"
                value={invoiceData.clientInfo.address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateClientInfo("address", e.target.value)}
                placeholder="Street, City, State, ZIP"
                rows={3}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Meta
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Identifiers and dates for this invoice.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                }
                placeholder="INV-001"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={invoiceData.currency}
                onValueChange={(value) =>
                  setInvoiceData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="invoiceDate">Invoice date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.date}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={invoiceData.taxRate}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, taxRate: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="discountRate">Discount (%)</Label>
              <Input
                id="discountRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={invoiceData.discountRate}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, discountRate: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invoiceStatus">Invoice Status</Label>
              <select
                id="invoiceStatus"
                value={invoiceData.status || 'pending'}
                onChange={(e) => {
                  const value = e.target.value as 'pending' | 'paid' | 'overdue' | 'cancelled';
                  console.log('Status changed to:', value);
                  setInvoiceData((prev) => ({ ...prev, status: value }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Draft</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* Line Items */}
      <section className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Line Items</h2>
            <p className="text-xs text-muted-foreground mt-1">Describe the services or products being billed.</p>
          </div>
          <Button onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <div className="space-y-4">
          {invoiceData.lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-12 md:col-span-5">
                <Label htmlFor={`description-${item.id}`}>
                  Description {index === 0 && "*"}
                </Label>
                <Input
                  id={`description-${item.id}`}
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  placeholder="Product or service description"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label htmlFor={`unitPrice-${item.id}`}>Unit Price</Label>
                <Input
                  id={`unitPrice-${item.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <Label>Total</Label>
                <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm">
                  {formatCurrency(item.total, invoiceData.currency)}
                </div>
              </div>
              <div className="col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  disabled={invoiceData.lineItems.length === 1}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Notes & Payment Terms</h2>
          <p className="text-xs text-muted-foreground mb-4">Any terms or additional info for your client.</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="e.g., Thank you for your business!"
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea
                id="paymentTerms"
                value={invoiceData.paymentTerms}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInvoiceData((prev) => ({ ...prev, paymentTerms: e.target.value }))
                }
                rows={2}
                placeholder="e.g., Payment due within 30 days"
              />
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-border/60 bg-background/30 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</span>
            </div>
            {invoiceData.discountRate > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount ({invoiceData.discountRate}%)</span>
                <span>-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Tax ({invoiceData.taxRate}%)</span>
              <span>{formatCurrency(invoiceData.taxAmount, invoiceData.currency)}</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(invoiceData.total, invoiceData.currency)}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={handleSave} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const { invoiceService } = await import("../lib/invoice-service");
                  const status = await invoiceService.getServiceStatus();
                  
                  const logoInfo = invoiceData.businessInfo.logo ? 
                    `Logo: ${(invoiceData.businessInfo.logo.length / 1024).toFixed(1)}KB` : 
                    'No logo';
                  
                  const message = `
🔍 Service Status:
• DynamoDB: ${status.dynamodb ? '✅ Connected' : '❌ Unavailable'}
• LocalStorage: ${status.localStorage ? '✅ Available' : '❌ Error'}

📊 Data Count:
• DynamoDB: ${status.dynamoCount} invoices
• LocalStorage: ${status.localCount} invoices

📷 Current Invoice:
• ${logoInfo}
• Business: "${invoiceData.businessInfo.name || 'Not set'}"
• Logo Type: ${invoiceData.businessInfo.logo ? (invoiceData.businessInfo.logo.startsWith('data:image/') ? 'Valid Base64' : 'Invalid Format') : 'None'}

${status.dynamodb ? '🎯 Using DynamoDB (Primary)' : '⚠️ Using LocalStorage (Fallback)'}
                  `;
                  
                  alert(message);
                  console.log("Service Status:", status);
                  console.log("Current invoice data:", invoiceData);
                } catch (error) {
                  alert("Service Test Failed: " + error.message);
                  console.error("Test error:", error);
                }
              }}
              variant="outline" 
              className="w-full"
            >
              📊 Debug Info
            </Button>
            <Button onClick={handleGeneratePDF} className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}



// Real-time Invoice Analytics Hook
import { useState, useEffect } from 'react';
import { invoiceService, InvoiceRecord } from '../invoice-service';

export interface InvoiceAnalytics {
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  draftAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  monthlyRevenue: number;
  monthlyInvoices: number;
}

export function useInvoiceAnalytics() {
  const [analytics, setAnalytics] = useState<InvoiceAnalytics>({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    draftAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    draftInvoices: 0,
    monthlyRevenue: 0,
    monthlyInvoices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const calculateAnalytics = async () => {
    try {
      setIsLoading(true);
      const invoices = await invoiceService.getAllInvoices();
      
      // Get current month for monthly calculations
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      });

      // Calculate totals by status
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
      const overdueInvoices = invoices.filter(inv => {
        if (inv.status === 'overdue') return true;
        // Auto-detect overdue: pending invoices past due date
        if (inv.status === 'pending') {
          const dueDate = new Date(inv.dueDate);
          const today = new Date();
          return dueDate < today;
        }
        return false;
      });
      const draftInvoices = invoices.filter(inv => inv.status === 'cancelled'); // Using cancelled as draft

      // Calculate amounts
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const draftAmount = draftInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      setAnalytics({
        totalRevenue,
        pendingAmount,
        paidAmount,
        overdueAmount,
        draftAmount,
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        draftInvoices: draftInvoices.length,
        monthlyRevenue,
        monthlyInvoices: monthlyInvoices.length,
      });

    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateAnalytics();
  }, []);

  // Refresh analytics (call this after creating/updating invoices)
  const refreshAnalytics = () => {
    calculateAnalytics();
  };

  return {
    analytics,
    isLoading,
    refreshAnalytics
  };
}
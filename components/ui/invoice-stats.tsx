"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { DollarSign, FileText, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Types and Interfaces
interface InvoiceStatCardProps {
  title: string
  amount: string
  count?: number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface InvoiceStatsProps {
  data?: InvoiceStatCardProps[]
}

// Utils
class Utils {
  static LOCALE = "en-IN"

  static formatNumber(n: number) {
    return new Intl.NumberFormat(this.LOCALE).format(n)
  }
}

// Default stats data (can be overridden)
const defaultStatsData: InvoiceStatCardProps[] = [
  {
    title: "Monthly Total",
    amount: "₹0",
    count: 0,
    icon: <DollarSign className="h-6 w-6" />,
    trend: {
      value: 0,
      isPositive: true
    }
  },
  {
    title: "Pending Amount",
    amount: "₹0",
    count: 0,
    icon: <Clock className="h-6 w-6" />,
    trend: {
      value: 0,
      isPositive: false
    }
  },
  {
    title: "Draft Invoices",
    amount: "₹0",
    count: 0,
    icon: <FileText className="h-6 w-6" />,
    trend: {
      value: 0,
      isPositive: true
    }
  }
]

// Simplified Stat Card Component
function InvoiceStatCard({ title, amount, count, icon, trend }: InvoiceStatCardProps) {
  const [animatedAmount, setAnimatedAmount] = useState("0")
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''))
    const prefix = amount.match(/[^0-9.]/g)?.[0] || ''

    let startValue = 0
    const duration = 1500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (numericAmount - startValue) * easeProgress

      setAnimatedAmount(prefix + Utils.formatNumber(Math.floor(currentValue)))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [isVisible, amount])

  return (
    <div ref={cardRef} className="w-full h-full">
      <div className={cn(
        "text-card-foreground bg-transparent flex flex-col h-full rounded-xl border border-border/60 bg-background/30 backdrop-blur-xl p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] hover:border-primary/50",
        !isVisible && "opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0 transition-all duration-800 ease-out"
      )}>
        <div className="flex items-start justify-between mb-auto">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {title}
            </p>
            <div className="text-3xl font-bold tracking-tight">
              {animatedAmount}
            </div>
            {count !== undefined && (
              <p className="text-sm text-muted-foreground mt-2">
                {count} {count === 1 ? 'invoice' : 'invoices'}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>

        <div className="mt-auto pt-4">
          {trend && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Component
export function InvoiceDashboardStats({ data = defaultStatsData }: InvoiceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {data.map((card, i) => (
        <InvoiceStatCard key={i} {...card} />
      ))}
    </div>
  )
}

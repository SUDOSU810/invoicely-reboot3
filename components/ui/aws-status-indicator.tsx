import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Database, HardDrive } from 'lucide-react'

interface AWSStatusProps {
  className?: string
}

export default function AWSStatusIndicator({ className = "" }: AWSStatusProps) {
  const [status, setStatus] = useState<{
    dynamodb: boolean
    localStorage: boolean
    dynamoCount: number
    localCount: number
  } | null>(null)

  const checkStatus = async () => {
    try {
      const { invoiceService } = await import('../../src/lib/invoice-service')
      const serviceStatus = await invoiceService.getServiceStatus()
      setStatus(serviceStatus)
    } catch (error) {
      console.error('Error checking AWS status:', error)
      setStatus({
        dynamodb: false,
        localStorage: true,
        dynamoCount: 0,
        localCount: 0
      })
    }
  }

  useEffect(() => {
    checkStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!status) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* DynamoDB Status */}
      <Badge 
        variant={status.dynamodb ? "default" : "secondary"}
        className={`flex items-center gap-1 ${
          status.dynamodb 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        }`}
      >
        {status.dynamodb ? (
          <Cloud className="h-3 w-3" />
        ) : (
          <CloudOff className="h-3 w-3" />
        )}
        <span className="text-xs">
          {status.dynamodb ? 'DynamoDB Online' : 'DynamoDB Offline'}
        </span>
      </Badge>

      {/* Data Source Indicator */}
      <Badge 
        variant="outline"
        className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border-blue-500/30"
      >
        {status.dynamodb ? (
          <Database className="h-3 w-3" />
        ) : (
          <HardDrive className="h-3 w-3" />
        )}
        <span className="text-xs">
          {status.dynamodb ? `Cloud (${status.dynamoCount})` : `Local (${status.localCount})`}
        </span>
      </Badge>
    </div>
  )
}
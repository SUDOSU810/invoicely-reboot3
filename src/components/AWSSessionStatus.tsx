// AWS Session Status Indicator
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { awsSessionManager } from '../lib/aws-session-manager';
import { Cloud, CloudOff, AlertTriangle } from 'lucide-react';

export function AWSSessionStatus() {
  const [sessionStatus, setSessionStatus] = useState({
    isExpired: true,
    isExpiringSoon: false,
    timeRemaining: 0,
    message: 'Checking AWS status...',
  });

  // Check session status every minute
  useEffect(() => {
    const checkStatus = () => {
      const status = awsSessionManager.checkSessionStatus();
      setSessionStatus(status);
    };

    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (sessionStatus.isExpired) {
      return <CloudOff className="h-4 w-4" />;
    } else if (sessionStatus.isExpiringSoon) {
      return <AlertTriangle className="h-4 w-4" />;
    } else {
      return <Cloud className="h-4 w-4" />;
    }
  };

  const getStatusVariant = () => {
    if (sessionStatus.isExpired) {
      return 'destructive';
    } else if (sessionStatus.isExpiringSoon) {
      return 'secondary';
    } else {
      return 'default';
    }
  };

  const getStatusText = () => {
    if (sessionStatus.isExpired) {
      return 'AWS Offline';
    } else if (sessionStatus.isExpiringSoon) {
      return 'AWS Expiring';
    } else {
      return 'AWS Connected';
    }
  };

  return (
    <div className="flex items-center gap-2">
    </div>
  );
}

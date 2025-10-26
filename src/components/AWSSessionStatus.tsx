// AWS Session Status Indicator
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { awsSessionManager } from '../lib/aws-session-manager';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';

export function AWSSessionStatus() {
  const [sessionStatus, setSessionStatus] = useState({
    isExpired: true,
    isExpiringSoon: false,
    timeRemaining: 0,
    message: 'Checking AWS status...'
  });
  const [credentialsText, setCredentialsText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleUpdateCredentials = () => {
    const credentials = awsSessionManager.parseAWSAcademyCredentials(credentialsText);
    
    if (credentials) {
      awsSessionManager.updateCredentials(credentials);
      setCredentialsText('');
      setIsDialogOpen(false);
      
      // Refresh status
      const newStatus = awsSessionManager.checkSessionStatus();
      setSessionStatus(newStatus);
      
      alert('✅ AWS credentials updated successfully!\n\nDynamoDB connection restored.');
      
      // Refresh the page to reconnect services
      window.location.reload();
    } else {
      alert('❌ Invalid credentials format. Please copy the complete AWS credentials from AWS Academy.');
    }
  };

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
      <Badge variant={getStatusVariant()} className="gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={sessionStatus.isExpired ? 'border-red-500 text-red-500' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {sessionStatus.isExpired ? 'Refresh AWS' : 'Update AWS'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update AWS Academy Credentials</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">📋 Instructions:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Go to <strong>AWS Academy Learner Lab</strong></li>
                <li>Click <strong>"Start Lab"</strong> (if stopped)</li>
                <li>Click <strong>"AWS Details"</strong></li>
                <li>Copy the <strong>entire credentials block</strong></li>
                <li>Paste it in the text area below</li>
                <li>Click <strong>"Update Credentials"</strong></li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">AWS Academy Credentials</Label>
              <Textarea
                id="credentials"
                placeholder="Paste your AWS Academy credentials here:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=..."
                value={credentialsText}
                onChange={(e) => setCredentialsText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Current Status:</strong> {sessionStatus.message}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCredentials}
                disabled={!credentialsText.trim()}
              >
                Update Credentials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
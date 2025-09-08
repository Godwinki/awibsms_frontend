'use client'

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ShieldAlert, User, Clock, Monitor } from 'lucide-react';
import { ActiveSession } from '@/lib/types/session';

interface SessionTerminationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string, reason: string) => Promise<void>;
  session: ActiveSession | null;
  isLoading?: boolean;
}

export default function SessionTerminationDialog({
  isOpen,
  onClose,
  onConfirm,
  session,
  isLoading = false
}: SessionTerminationDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const REQUIRED_TEXT = 'TERMINATE SESSION';
  const MIN_REASON_LENGTH = 10;

  const handleConfirm = async () => {
    setError('');

    // Validate confirmation text
    if (confirmationText !== REQUIRED_TEXT) {
      setError(`Please type "${REQUIRED_TEXT}" exactly to confirm`);
      return;
    }

    // Validate reason
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setError(`Reason must be at least ${MIN_REASON_LENGTH} characters long`);
      return;
    }

    if (!session) {
      setError('No session selected');
      return;
    }

    try {
      await onConfirm(session.id, reason.trim());
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to terminate session');
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setReason('');
    setError('');
    onClose();
  };

  const isConfirmEnabled = 
    confirmationText === REQUIRED_TEXT && 
    reason.trim().length >= MIN_REASON_LENGTH && 
    !isLoading;

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
            Terminate User Session
          </DialogTitle>
          <DialogDescription>
            This action will immediately log out the user and invalidate their session.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">
              Session Details
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{session.user.name}</span>
                <span className="text-gray-500">({session.user.email})</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Active for: {session.duration}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500 truncate">
                  {session.ipAddress} • {session.userAgent?.split(' ')[0] || 'Unknown Browser'}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Warning:</strong> The user will be immediately logged out and will need to 
              sign in again. Any unsaved work may be lost.
            </AlertDescription>
          </Alert>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Termination *
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for terminating this session (e.g., security concern, policy violation, maintenance, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              {reason.length}/{MIN_REASON_LENGTH} characters minimum
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type "{REQUIRED_TEXT}" to confirm *
            </Label>
            <Input
              id="confirmation"
              placeholder={REQUIRED_TEXT}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="font-mono text-sm"
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className="min-w-[120px]"
          >
            {isLoading ? 'Terminating...' : 'Terminate Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

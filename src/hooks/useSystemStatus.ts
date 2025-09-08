'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingService, { SystemStatus } from '@/lib/services/onboarding.service';

export function useSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      const statusData = await OnboardingService.getSystemStatus();
      setSystemStatus(statusData);
      
      // Redirect logic based on system status
      if (statusData.needsOnboarding && window.location.pathname !== '/onboarding') {
        router.push('/onboarding');
      } else if (!statusData.needsOnboarding && window.location.pathname === '/onboarding') {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    systemStatus,
    loading,
    needsOnboarding: systemStatus?.needsOnboarding || false,
    isInitialized: systemStatus?.isInitialized || false,
    refreshStatus: checkSystemStatus
  };
}

export default useSystemStatus;

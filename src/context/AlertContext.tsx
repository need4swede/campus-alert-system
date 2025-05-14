
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, AlertType, User } from '@/types';
import { toast } from "@/components/ui/sonner";

interface AlertContextType {
  currentAlert: Alert | null;
  alertHistory: Alert[];
  initiateAlert: (type: AlertType, user: User, note?: string) => void;
  resolveAlert: (user: User) => void;
  changeAlertType: (type: AlertType, user: User) => void;
  canResolveAlert: (user: User) => boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);

  // This would be replaced with actual API calls in a production app
  useEffect(() => {
    // Load initial state from localStorage or API
    const savedAlert = localStorage.getItem('currentAlert');
    const savedHistory = localStorage.getItem('alertHistory');
    
    if (savedAlert) {
      setCurrentAlert(JSON.parse(savedAlert));
    }
    
    if (savedHistory) {
      setAlertHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (currentAlert) {
      localStorage.setItem('currentAlert', JSON.stringify(currentAlert));
    } else {
      localStorage.removeItem('currentAlert');
    }
    
    localStorage.setItem('alertHistory', JSON.stringify(alertHistory));
  }, [currentAlert, alertHistory]);

  const initiateAlert = (type: AlertType, user: User, note?: string) => {
    if (currentAlert && currentAlert.active) {
      toast.error("An alert is already active. Please resolve it first.");
      return;
    }

    if (!type) return;

    const newAlert: Alert = {
      id: crypto.randomUUID(),
      type,
      initiatedBy: user,
      timestamp: new Date(),
      active: true,
      note
    };

    setCurrentAlert(newAlert);
    setAlertHistory(prev => [newAlert, ...prev]);
    
    toast.warning(`${type.toUpperCase()} alert has been initiated by ${user.name}`);
  };

  const resolveAlert = (user: User) => {
    if (!currentAlert) return;

    const resolvedAlert: Alert = {
      ...currentAlert,
      active: false,
      resolvedBy: user,
      resolvedAt: new Date()
    };

    setCurrentAlert(null);
    setAlertHistory(prev => 
      prev.map(alert => 
        alert.id === resolvedAlert.id ? resolvedAlert : alert
      )
    );
    
    toast.success(`${resolvedAlert.type?.toUpperCase()} alert has been resolved by ${user.name}`);
  };

  const changeAlertType = (newType: AlertType, user: User) => {
    if (!currentAlert || !currentAlert.active) return;
    
    if (currentAlert.type === newType) {
      toast.info(`Alert is already set to ${newType.toUpperCase()}`);
      return;
    }

    // Create a changelog entry with the old alert as resolved
    const resolvedAlert: Alert = {
      ...currentAlert,
      active: false,
      resolvedBy: user,
      resolvedAt: new Date()
    };

    // Create a new alert with the new type
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      type: newType,
      initiatedBy: user,
      timestamp: new Date(),
      active: true,
      note: `Escalated from ${currentAlert.type} alert`
    };

    setCurrentAlert(newAlert);
    setAlertHistory(prev => [newAlert, ...prev.map(alert => 
      alert.id === resolvedAlert.id ? resolvedAlert : alert
    )]);
    
    toast.warning(`Alert type changed from ${currentAlert.type?.toUpperCase()} to ${newType.toUpperCase()} by ${user.name}`);
  };

  const canResolveAlert = (user: User): boolean => {
    if (!currentAlert) return false;
    
    // The user who initiated the alert can always resolve it
    if (currentAlert.initiatedBy.id === user.id) return true;
    
    // Admins and super-admins can resolve any alert
    return user.role === 'admin' || user.role === 'super-admin';
  };

  return (
    <AlertContext.Provider
      value={{
        currentAlert,
        alertHistory,
        initiateAlert,
        resolveAlert,
        changeAlertType,
        canResolveAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

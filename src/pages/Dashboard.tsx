
import React, { useState } from 'react';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProtocolMessage } from '@/data/protocol-messages';
import { PauseCircle, ShieldCheck, Lock, LogOut, Home } from 'lucide-react';
import { AlertType } from '@/types';

const Dashboard = () => {
  const { currentAlert, initiateAlert, resolveAlert, canResolveAlert } = useAlert();
  const { user } = useAuth();
  const [note, setNote] = useState('');
  
  // Configuration values (would come from settings/database in production)
  const config = {
    location: 'Main Parking Lot',
    hazard: 'Tornado',
  };

  const handleInitiateAlert = (type: AlertType) => {
    if (!user) return;
    initiateAlert(type, user, note);
    setNote('');
  };

  const handleResolveAlert = () => {
    if (!user || !currentAlert) return;
    resolveAlert(user);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentAlert && currentAlert.active ? (
        <div className="p-6 rounded-lg mb-8 text-center animate-pulse shadow-lg bg-white dark:bg-gray-800">
          <h2 className={`text-3xl font-bold mb-4 uppercase text-alert-${currentAlert.type}`}>
            Active {currentAlert.type} Alert
          </h2>
          <p className="text-xl mb-4">{getProtocolMessage(currentAlert.type, config)}</p>
          <p className="text-sm mb-6">
            Initiated by {currentAlert.initiatedBy.name} at{' '}
            {new Date(currentAlert.timestamp).toLocaleTimeString()}
          </p>
          {currentAlert.note && (
            <div className="bg-muted p-4 rounded mb-6">
              <p className="italic">"{currentAlert.note}"</p>
            </div>
          )}
          {canResolveAlert(user!) && (
            <Button
              variant="destructive"
              size="lg"
              onClick={handleResolveAlert}
              className="mt-2"
            >
              Resolve Alert
            </Button>
          )}
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Initiate Emergency Response</h2>
          <Card className="mb-4">
            <CardContent className="p-4">
              <Textarea
                placeholder="Optional: Add notes about the emergency situation"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mb-4"
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              className="emergency-button hold"
              onClick={() => handleInitiateAlert('hold')}
            >
              <PauseCircle className="h-8 w-8" />
              <div>Hold</div>
            </button>
            
            <button
              className="emergency-button secure"
              onClick={() => handleInitiateAlert('secure')}
            >
              <ShieldCheck className="h-8 w-8" />
              <div>Secure</div>
            </button>
            
            <button
              className="emergency-button lockdown"
              onClick={() => handleInitiateAlert('lockdown')}
            >
              <Lock className="h-8 w-8" />
              <div>Lockdown</div>
            </button>
            
            <button
              className="emergency-button evacuate"
              onClick={() => handleInitiateAlert('evacuate')}
            >
              <LogOut className="h-8 w-8" />
              <div>Evacuate</div>
            </button>
            
            <button
              className="emergency-button shelter"
              onClick={() => handleInitiateAlert('shelter')}
            >
              <Home className="h-8 w-8" />
              <div>Shelter</div>
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Alerts</h3>
        {useAlert().alertHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {useAlert()
              .alertHistory.slice(0, 5)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span className={`uppercase text-alert-${alert.type}`}>
                        {alert.type} Alert
                      </span>
                      <span className="text-sm font-normal">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Initiated by <strong>{alert.initiatedBy.name}</strong>
                    </p>
                    {alert.resolvedBy && (
                      <p className="text-sm">
                        Resolved by <strong>{alert.resolvedBy.name}</strong> at{' '}
                        {new Date(alert.resolvedAt!).toLocaleTimeString()}
                      </p>
                    )}
                    {alert.note && (
                      <p className="text-sm mt-2 italic">Note: "{alert.note}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p>No recent alerts</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

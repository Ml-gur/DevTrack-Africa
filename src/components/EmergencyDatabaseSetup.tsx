import React from 'react';
import { Button } from './ui/button';
import { Database, AlertTriangle } from 'lucide-react';

interface EmergencyDatabaseSetupProps {
  onSetupDatabase: () => void;
}

export default function EmergencyDatabaseSetup({ onSetupDatabase }: EmergencyDatabaseSetupProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border border-red-700">
        <div className="flex items-center space-x-3 mb-3">
          <AlertTriangle className="w-5 h-5" />
          <div className="font-semibold">Database Error Detected</div>
        </div>
        
        <p className="text-sm text-red-100 mb-3">
          Database tables not found. Click below to set up your database.
        </p>
        
        <div className="space-y-2">
          <Button
            onClick={onSetupDatabase}
            className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold"
            size="sm"
          >
            <Database className="w-4 h-4 mr-2" />
            Fix Database Now
          </Button>
          
          <div className="text-xs text-red-200 text-center">
            This will take 30 seconds to fix
          </div>
        </div>
      </div>
    </div>
  );
}
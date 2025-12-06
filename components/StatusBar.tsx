import React from 'react';

interface StatusBarProps {
  status: 'checking' | 'connected' | 'disconnected';
  message?: string;
  details?: any;
  onRetry?: () => void;
}

export default function StatusBar({ status, message, details }: StatusBarProps) {
  let statusColor = 'bg-gray-500';
  if (status === 'connected') statusColor = 'bg-green-600';
  if (status === 'disconnected') statusColor = 'bg-red-600';
  if (status === 'checking') statusColor = 'bg-yellow-500';

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white text-sm flex justify-between items-stretch shadow-lg z-50 h-8">
      <div className="flex items-center px-4 flex-1 overflow-hidden">
        <span className="truncate">{message || 'Ready'}</span>
        {details && <span className="ml-4 text-xs opacity-60 hidden md:inline font-mono truncate">| {JSON.stringify(details)}</span>}
      </div>

      <div className={`${statusColor} px-4 flex items-center justify-center font-bold uppercase tracking-wider min-w-[120px] transition-colors duration-300`}>
        {status === 'connected' && <span className="mr-2">●</span>}
        {status}
      </div>
    </div>
  );
}

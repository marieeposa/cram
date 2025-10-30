'use client';
import { Activity } from 'lucide-react';

export default function RealTimeIndicator({ lastUpdate }) {
  if (!lastUpdate) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <Activity size={14} />
        <span>Connecting...</span>
      </div>
    );
  }

  const timeDiff = Math.floor((new Date() - lastUpdate) / 1000);
  const isRecent = timeDiff < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
      isRecent 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      <Activity size={16} className={isRecent ? 'animate-pulse' : ''} />
      <span>
        {isRecent 
          ? '🟢 LIVE DATA' 
          : `⚠️ Updated ${timeDiff}s ago`
        }
      </span>
    </div>
  );
}
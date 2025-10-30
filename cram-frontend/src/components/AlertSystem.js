'use client';
import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AlertSystem({ barangays }) {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [hasNewAlerts, setHasNewAlerts] = useState(false);

  useEffect(() => {
    if (!barangays || barangays.length === 0) return;

    const highRiskAlerts = [];
    const processedIds = new Set(); // Prevent duplicates
    
    barangays.forEach((b, index) => {
      const props = b.properties || b;
      const score = props.resilience_score || 0;
      const barangayId = props.id || `brgy-${index}`; // Use index as fallback
      
      // Skip if already processed
      if (processedIds.has(barangayId)) return;
      processedIds.add(barangayId);
      
      // Critical risk alert
      if (score >= 70) {
        highRiskAlerts.push({
          id: `critical-${barangayId}`,
          type: 'critical',
          title: '🚨 Critical Risk Alert',
          message: `${props.name || 'Unknown'} has a very high BRRS score of ${score.toFixed(1)}`,
          barangay: props.name || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
      // High risk alert
      else if (score >= 50) {
        highRiskAlerts.push({
          id: `high-${barangayId}`,
          type: 'warning',
          title: '⚠️ High Risk Warning',
          message: `${props.name || 'Unknown'} requires immediate attention (BRRS: ${score.toFixed(1)})`,
          barangay: props.name || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
      
      // Check for coastal + high risk combination
      if (props.is_coastal && score >= 40) {
        highRiskAlerts.push({
          id: `coastal-${barangayId}`,
          type: 'info',
          title: '🌊 Coastal Risk Alert',
          message: `${props.name || 'Unknown'} is coastal with elevated risk (BRRS: ${score.toFixed(1)})`,
          barangay: props.name || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
    });

    setAlerts(highRiskAlerts);
    setHasNewAlerts(highRiskAlerts.length > 0);
  }, [barangays]);

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (alerts.length === 1) {
      setHasNewAlerts(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="text-red-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'info': return <Info className="text-blue-500" size={24} />;
      default: return <CheckCircle className="text-green-500" size={24} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-300 bg-red-50';
      case 'warning': return 'border-yellow-300 bg-yellow-50';
      case 'info': return 'border-blue-300 bg-blue-50';
      default: return 'border-green-300 bg-green-50';
    }
  };

  return (
    <>
      {/* Alert Bell Button */}
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
        aria-label="View alerts"
      >
        <Bell size={24} />
        {hasNewAlerts && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Alert Panel */}
      {showAlerts && (
        <div className="fixed bottom-24 right-6 z-[9999] w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <h3 className="font-bold">Risk Alerts</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {alerts.length}
              </span>
            </div>
            <button
              onClick={() => setShowAlerts(false)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              aria-label="Close alerts"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                <p className="font-semibold">All Clear!</p>
                <p className="text-sm">No active risk alerts</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border-2 ${getAlertColor(alert.type)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setAlerts([])}
                className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
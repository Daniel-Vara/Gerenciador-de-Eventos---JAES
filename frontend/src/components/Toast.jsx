import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

/**
 * TOAST NOTIFICATION COMPONENT
 * 
 * Renders beautiful success or error toasts with automated dismiss timers,
 * matching the orange/dark theme of the system.
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast-card animate-slide-in ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
      <div className="toast-icon">
        {type === 'success' ? (
          <CheckCircle size={20} className="icon-emerald" />
        ) : (
          <AlertTriangle size={20} className="icon-crimson" />
        )}
      </div>
      
      <div className="toast-content">
        <p>{message}</p>
      </div>

      <button className="toast-close" onClick={onClose} aria-label="Close Notification">
        <X size={16} />
      </button>
    </div>
  );
}

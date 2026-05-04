'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Bell } from 'lucide-react';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 mr-2" />,
    error: <XCircle className="w-5 h-5 mr-2" />,
    info: <Bell className="w-5 h-5 mr-2" />
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-xl border-l-4 shadow-2xl flex items-center z-50 animate-bounce-short ${styles[type]}`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
}

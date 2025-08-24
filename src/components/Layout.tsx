'use client';

import React from 'react';
import { DateTime } from 'luxon';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

export default function Layout({ children, title = "STEAL YOUR STATS", onClose }: LayoutProps) {
  const [currentTime, setCurrentTime] = React.useState(DateTime.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Top Bar - Brutalist Style */}
      <div className="border-[3px] border-black bg-black text-white px-4 py-2 flex justify-between items-center mb-4">
        <span className="font-bold uppercase tracking-wider">IS</span>
        <div className="flex items-center space-x-4">
          <span className="text-sm">stealyourstats@gmail.com</span>
          <div className="w-4 h-4 bg-white border-2 border-white"></div>
        </div>
      </div>

      {/* Main Window - Brutalist Style */}
      <div className="window-shell max-w-6xl mx-auto">
        {/* Title Bar */}
        <div className="window-titlebar">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose}
              className="close-btn"
            >
              ×
            </button>
            <h1>{title}</h1>
          </div>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-white border-2 border-white"></div>
            <div className="w-4 h-4 bg-white border-2 border-white"></div>
            <div className="w-4 h-4 bg-white border-2 border-white"></div>
          </div>
        </div>

        {/* Window Content */}
        <div className="window-content">
          {children}
        </div>
      </div>

      {/* Time Display - Brutalist Style */}
      <div className="fixed top-20 right-8 text-black text-sm font-mono bg-white px-3 py-2 border-[3px] border-black">
        {currentTime.toFormat('h:mm A')}
      </div>
    </div>
  );
}

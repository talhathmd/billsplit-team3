'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';

export default function DashboardTutorial() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if dashboard tutorial has been shown
    const tutorialShown = localStorage.getItem('dashboardTutorialCompleted');
    if (tutorialShown === 'true') {
      setIsVisible(false);
      return;
    }

    // Position popup in the center of the screen
    const updatePosition = () => {
      if (popupRef.current) {
        const popupRect = popupRef.current.getBoundingClientRect();
        setPopupPosition({
          top: (window.innerHeight - popupRect.height) / 2,
          left: (window.innerWidth - popupRect.width) / 2
        });
      }
    };

    // Initial position after a small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);

    // Update position on window resize
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const handleGotIt = () => {
    localStorage.setItem('dashboardTutorialCompleted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-30" />
      
      {/* Popup */}
      <div
        ref={popupRef}
        style={{
          position: 'fixed',
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
          zIndex: 50,
        }}
        className="shadow-2xl animate-fade-in"
      >
        <Card className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-xl font-bold mb-4 text-emerald-600">Welcome to Your Dashboard!</h3>
          <div className="space-y-4 text-gray-600">
            <p className="font-semibold text-emerald-600">Important Note:</p>
            <p>Before splitting bills, make sure to add your contacts first! This will allow you to share bills with them.</p>
            
            <p className="font-semibold mt-4">Here's what you can do:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Contacts:</span> Add and manage your contacts</li>
              <li><span className="font-semibold">New Split:</span> Upload a bill to split with your contacts</li>
              <li><span className="font-semibold">History:</span> View your past bills and splits</li>
            </ul>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleGotIt}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
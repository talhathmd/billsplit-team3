'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from './ui/card';

interface TutorialStep {
  title: string;
  content: string;
  element?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tutorial() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const getDashboardTutorial = (): TutorialStep => ({
    title: "Welcome to Your Dashboard!",
    content: "📌 Important: Add your contacts first before splitting bills!\n\nHere's what you can do:\n• Contacts: Add and manage your contacts\n• New Split: Upload a bill to split with your contacts\n• History: View your past bills and splits",
    element: "new-split",
    position: 'right'
  });

  const getCurrentTutorial = (): TutorialStep | null => {
    if (!isMounted || !isSignedIn) return null;

    if (pathname === '/dashboard') {
      const dashboardShown = window.localStorage.getItem('dashboardTutorialCompleted');
      return dashboardShown !== 'true' ? getDashboardTutorial() : null;
    }
    return null;
  };

  const updatePopupPosition = () => {
    const tutorial = getCurrentTutorial();
    if (!tutorial?.element || !popupRef.current) return;

    const element = document.querySelector(`[data-tutorial="${tutorial.element}"]`);
    if (!element) return;

    const elementRect = element.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // For mobile screens (less than 640px - Tailwind's sm breakpoint)
    if (windowWidth < 640) {
      // Position below the element on mobile
      const top = elementRect.bottom + 20; // 20px gap
      const left = Math.max(10, Math.min(windowWidth - popupRect.width - 10,
        elementRect.left + (elementRect.width - popupRect.width) / 2));
      setPopupPosition({ top, left });
    } else {
      // Desktop positioning (to the right)
      const top = elementRect.top + (elementRect.height - popupRect.height) / 2;
      const left = elementRect.right + 20; // 20px gap
      setPopupPosition({ top, left });
    }
  };

  // Handle component mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle tutorial visibility and positioning
  useEffect(() => {
    if (isMounted) {
      const tutorial = getCurrentTutorial();
      if (tutorial) {
        setIsVisible(true);
        // Small delay to ensure DOM is ready
        setTimeout(updatePopupPosition, 100);
      } else {
        setIsVisible(false);
      }
    }
  }, [pathname, isMounted, isSignedIn]);

  // Handle window events
  useEffect(() => {
    if (isVisible && isMounted) {
      window.addEventListener('resize', updatePopupPosition);
      document.addEventListener('scroll', updatePopupPosition, true);

      return () => {
        window.removeEventListener('resize', updatePopupPosition);
        document.removeEventListener('scroll', updatePopupPosition, true);
      };
    }
  }, [isVisible, isMounted]);

  const handleGotIt = () => {
    const tutorial = getCurrentTutorial();
    if (!tutorial || !isMounted) return;

    if (pathname === '/dashboard') {
      window.localStorage.setItem('dashboardTutorialCompleted', 'true');
    }
    setIsVisible(false);
  };

  // Don't render anything during SSR
  if (!isMounted) return null;

  const tutorial = getCurrentTutorial();
  if (!isVisible || !tutorial) return null;

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
        <Card className="bg-white p-4 rounded-lg w-72">
          <h3 className="text-lg font-bold mb-2 text-emerald-600">{tutorial.title}</h3>
          <p className="text-gray-600 mb-4 text-sm whitespace-pre-line">{tutorial.content}</p>
          <div className="flex justify-end">
            <button
              onClick={handleGotIt}
              className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </Card>

        {/* Arrow pointing to the element */}
        <div
          style={{
            position: 'absolute',
            left: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: '10px solid white'
          }}
        />
      </div>
    </>
  );
}
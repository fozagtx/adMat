import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MessageSquareIcon } from './Icons';

export const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for toggle messages from background script
    const handleMessage = (request: { type: string }) => {
      if (request.type === 'TOGGLE_SIDEBAR') {
        setIsOpen((prev) => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Adjust page layout when sidebar opens
  useEffect(() => {
    document.body.classList.toggle('hdc-page-adjusted', isOpen);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      <button
        className={`hdc-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        title="Toggle Doc Chat"
      >
        <MessageSquareIcon />
      </button>

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

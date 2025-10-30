'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export default function InfoTooltip({ title, content }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    }
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show]);

  const tooltip = show && mounted ? createPortal(
    <div 
      className="fixed z-[99999] w-80 p-4 bg-white rounded-xl shadow-2xl border-2 border-blue-200 text-sm animate-fadeIn"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px` 
      }}
    >
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l-2 border-t-2 border-blue-200 transform rotate-45"></div>
      <h4 className="font-bold text-gray-900 mb-2 text-base">{title}</h4>
      <p className="text-gray-700 leading-relaxed">{content}</p>
      <button
        onClick={() => setShow(false)}
        className="mt-3 text-xs text-blue-600 font-semibold hover:text-blue-800"
      >
        ✕ Close
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        className="ml-1 inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
        aria-label="More information"
      >
        <Info size={16} />
      </button>
      {tooltip}
    </>
  );
}
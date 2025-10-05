import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'sm' }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  
  // Set modal width based on size property
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
  };

  // Apply entrance animation when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      // Trigger reflow to ensure the animation plays
      modalRef.current.offsetHeight;
      overlayRef.current.offsetHeight;
      // Apply the visible state with enhanced animations
      modalRef.current.classList.remove('opacity-0', 'scale-95', 'translate-y-8');
      modalRef.current.classList.add('opacity-100', 'scale-100', 'translate-y-0');
      overlayRef.current.classList.remove('opacity-0');
      overlayRef.current.classList.add('opacity-100');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay with enhanced blur and gradient */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-accent-900/15 to-secondary-900/10 backdrop-blur-md transition-all duration-500 ease-out opacity-0"
        onClick={onClose}
      ></div>

      {/* Modal container with enhanced animations */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-6 text-center sm:block sm:p-0">
        {/* Modal content with modern styling and animations */}
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all duration-500 ease-out sm:my-8 sm:align-middle w-full mx-2 ${sizeClasses[size]} opacity-0 scale-95 translate-y-8 border border-white/30`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
        >
          {/* Modal header with black bold title */}
          <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 bg-white">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full text-secondary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body with enhanced styling */}
          <div className="px-6 py-6 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm">
            {children}
          </div>

          {/* Modal footer with gradient background */}
          {footer && (
            <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-primary-50/60 to-accent-50/60 backdrop-blur-sm">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Header component
Modal.Header = ({ children, className = '' }) => {
  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Modal Body component
Modal.Body = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Modal Footer component
Modal.Footer = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 sm:flex sm:flex-row-reverse border-t border-gray-100 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
};

export default Modal;
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'sm' }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  
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
    if (isOpen && modalRef.current) {
      // Trigger reflow to ensure the animation plays
      modalRef.current.offsetHeight;
      // Apply the visible state
      modalRef.current.classList.remove('opacity-0', 'translate-y-4');
      modalRef.current.classList.add('opacity-100', 'translate-y-0');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay with blur effect */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal container with smooth entrance animation */}
      <div className="flex items-center justify-center min-h-screen px-2 pt-4 pb-6 text-center sm:block sm:p-0">
        {/* Modal content with enhanced styling and animations */}
        <div 
          ref={modalRef}
          className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} opacity-0 translate-y-4 duration-300 ease-out`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
        >
          {/* Modal header with improved styling */}
          <div className="flex justify-between items-center px-3 py-2 sm:px-6 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-base sm:text-xl font-semibold text-gray-800">{title}</h3>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-all duration-200"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body with improved padding and spacing */}
          <div className="px-3 py-2.5 sm:px-6 sm:py-6">
            {children}
          </div>

          {/* Modal footer with enhanced styling */}
          {footer && (
            <div className="bg-gray-50 px-3 py-2.5 sm:px-6 sm:py-4 sm:flex sm:flex-row-reverse border-t border-gray-100 rounded-b-2xl">
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
    <div className={`mb-2 sm:mb-4 ${className}`}>
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

export default Modal;
'use client';

import React from 'react';

interface ImagePreviewProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] animate-fade-in"
      onClick={onClose}
    >
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <button 
        className="absolute top-4 right-6 text-white text-4xl font-bold hover:opacity-80 transition-opacity"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};

export default ImagePreview; 

import React from 'react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose }) => {
  return (
    <div 
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-2 animate-in fade-in duration-200"
        onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-safe right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10 backdrop-blur-sm"
      >
        <X size={24} />
      </button>
      <img 
        src={src} 
        alt="Fullscreen" 
        className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

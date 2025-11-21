

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string | React.ReactNode;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
  hideBack?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  onBack, 
  rightElement,
  className = "",
  hideBack = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`shrink-0 p-4 border-b border-white/5 flex items-center justify-between bg-bg sticky top-0 z-10 ${className}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        {!hideBack && (
          <button 
            onClick={handleBack} 
            className="p-2 -ml-2 hover:bg-white/10 rounded-full active:bg-white/20 transition-colors text-white"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="text-lg font-bold text-white truncate">
          {title}
        </div>
      </div>
      
      {rightElement && (
        <div className="shrink-0 ml-2">
          {rightElement}
        </div>
      )}
    </div>
  );
};
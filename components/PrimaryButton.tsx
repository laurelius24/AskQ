

import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  fullWidth = true, 
  variant = 'primary',
  className = '',
  disabled,
  ...props 
}) => {
  
  const baseStyles = "py-4 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-primary/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 shadow-none",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-danger/20",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed shadow-none active:scale-100";

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? disabledStyles : ''} 
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
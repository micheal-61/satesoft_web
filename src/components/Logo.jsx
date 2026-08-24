import React from 'react';

const Logo = ({ className = '', textClassName = 'text-lime-400', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/assets/images/satesoft_logo.png" 
        alt="Satesoft Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold tracking-wide ${textClassName}`}>
          Satesoft
        </span>
      )}
    </div>
  );
};

export default Logo;

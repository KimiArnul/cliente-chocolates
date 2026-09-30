import React, { useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#3e2723] via-[#271310] to-[#181816] text-[#ffe085] p-4 text-center select-none ${className}`}
        role="img"
        aria-label={alt || fallbackLabel || 'Chocolates SV'}
      >
        <span className="material-symbols-outlined text-3xl mb-1 opacity-80">
          redeem
        </span>
        <span className="font-display-lg text-xs tracking-widest uppercase opacity-90 line-clamp-2">
          {fallbackLabel || alt || 'Chocolates SV'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Chocolates SV'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};

import { useState } from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-label-sm',
  md: 'w-10 h-10 text-label-md',
  lg: 'w-16 h-16 text-headline-sm',
};

export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showInitials = !src || imgError;

  if (showInitials) {
    return (
      <div
        className={`
          rounded-full bg-primary-container text-on-primary-container
          flex items-center justify-center font-bold
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {initials?.slice(0, 2).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={`
        rounded-full object-cover
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
}

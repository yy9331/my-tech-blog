'use client'
import React from 'react';

interface ImageRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onImageClick?: (src: string) => void;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ src, alt, onImageClick, ...props }) => {
  const handleClick = () => {
    if (typeof src === 'string' && onImageClick) {
      onImageClick(src);
    }
  };

  if (!src) return null;
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt} 
      onClick={handleClick}
      className={`cursor-pointer ${props.className || ''}`}
      {...props}
    />
  );
};

export default ImageRenderer; 
import React from 'react';

interface ViewerProps {
  photos: string[];
  currentIndex: number;
}

export const PhotoViewer: React.FC<ViewerProps> = ({
  photos,
  currentIndex,
}) => {
  const photo = photos[currentIndex];
  if (!photo) return null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center p-0 z-10">
        <img
          src={photo}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};
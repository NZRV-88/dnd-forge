import React from 'react';
import DynamicFrame from './DynamicFrame';

interface AvatarFrameProps {
  children: React.ReactNode;
  className?: string;
  frameColor?: string;
}

export default function AvatarFrame({ children, className = '', frameColor = 'gold' }: AvatarFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <DynamicFrame
        frameType="prof" // Используем prof frame для портрета
        color={frameColor}
        size="large"
        className="w-32 h-32 mx-auto"
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full h-full flex items-center justify-center">
            {children}
          </div>
        </div>
      </DynamicFrame>
    </div>
  );
}

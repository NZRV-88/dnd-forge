import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FrameColorContextType {
  frameColor: string;
  setFrameColor: (color: string) => void;
}

const FrameColorContext = createContext<FrameColorContextType | undefined>(undefined);

export const useFrameColor = () => {
  const context = useContext(FrameColorContext);
  if (!context) {
    throw new Error('useFrameColor must be used within a FrameColorProvider');
  }
  return context;
};

interface FrameColorProviderProps {
  children: ReactNode;
}

export const FrameColorProvider = ({ children }: FrameColorProviderProps) => {
  const [frameColor, setFrameColor] = useState('gold');

  return (
    <FrameColorContext.Provider value={{ frameColor, setFrameColor }}>
      {children}
    </FrameColorContext.Provider>
  );
};

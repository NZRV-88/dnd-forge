import React, { createContext, useContext } from "react";

// Создаем простой контекст для TooltipProvider
const TooltipContext = createContext<{ delayDuration?: number }>({});

export const TooltipProvider = ({ children, delayDuration = 0 }: { children: React.ReactNode; delayDuration?: number }) => {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Простые заглушки для совместимости
export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children, side, className }: { children: React.ReactNode; side?: string; className?: string }) => {
  return <>{children}</>;
};
import React from 'react';
import { Settings } from 'lucide-react';

interface FrameSettingsButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function FrameSettingsButton({ 
  className = '',
  onClick
}: FrameSettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors ${className}`}
      title="Настройки"
    >
      <Settings className="w-4 h-4 text-gray-300" />
    </button>
  );
}

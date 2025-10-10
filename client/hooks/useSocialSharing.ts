import { useState } from 'react';

export interface ShareRollData {
  characterName?: string;
  description: string;
  dice: string;
  modifier: number;
  result: number;
  diceRoll: number;
  type: string;
  individualRolls?: number[];
}

export interface ShareRollResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function useSocialSharing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareToTelegram = async (rollData: ShareRollData, chatId: string, messageThreadId?: string): Promise<ShareRollResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollData,
          chatId,
          messageThreadId,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to share to Telegram');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const shareToVK = async (rollData: ShareRollData, userId: string): Promise<ShareRollResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/vk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollData,
          userId,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to share to VK');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const shareRoll = async (platform: 'telegram' | 'vk', rollData: ShareRollData, chatId?: string, userId?: string, messageThreadId?: string): Promise<ShareRollResponse> => {
    if (platform === 'telegram' && chatId) {
      return shareToTelegram(rollData, chatId, messageThreadId);
    } else if (platform === 'vk' && userId) {
      return shareToVK(rollData, userId);
    } else {
      const errorMessage = 'Missing required parameters for sharing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    shareRoll,
    shareToTelegram,
    shareToVK,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

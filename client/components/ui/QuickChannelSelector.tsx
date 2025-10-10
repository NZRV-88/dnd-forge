import React from 'react';
import { Hash, Users, MessageCircle } from 'lucide-react';

interface QuickChannelSelectorProps {
  onSelectChannel: (platform: 'telegram' | 'vk', channelId: string, channelName: string, messageThreadId?: string) => void;
}

// Предустановленные популярные D&D каналы и группы
const PRESET_CHANNELS = {
  telegram: [
    {
      id: '@dnd_russia',
      name: 'D&D Россия',
      description: 'Официальный канал D&D в России',
      icon: <Hash className="w-4 h-4" />
    },
    {
      id: '@dnd_community',
      name: 'D&D Community',
      description: 'Сообщество игроков D&D',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: '@dnd_rolls',
      name: 'D&D Rolls',
      description: 'Канал для результатов бросков',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      id: '364317296',
      name: 'Личные сообщения',
      description: 'Отправить себе в личку',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      id: '-1002519374277',
      name: 'Ваша группа',
      description: 'Группа для результатов бросков',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: '-1002519374277',
      name: 'Топик в группе',
      description: 'Отправка в конкретный топик',
      icon: <MessageCircle className="w-4 h-4" />,
      messageThreadId: '7357'
    }
  ],
  vk: [
    {
      id: '-123456789',
      name: 'D&D Россия VK',
      description: 'Группа D&D в ВКонтакте',
      icon: <Hash className="w-4 h-4" />
    },
    {
      id: '-987654321',
      name: 'D&D Community VK',
      description: 'Сообщество игроков D&D',
      icon: <Users className="w-4 h-4" />
    }
  ]
};

export default function QuickChannelSelector({ onSelectChannel }: QuickChannelSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Быстрый выбор каналов</h3>
      
      {/* Telegram каналы */}
      <div>
        <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Telegram
        </h4>
        <div className="space-y-2">
          {PRESET_CHANNELS.telegram.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel('telegram', channel.id, channel.name, (channel as any).messageThreadId)}
              className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {channel.icon}
                <div>
                  <div className="font-medium text-white">{channel.name}</div>
                  <div className="text-xs text-gray-400">{channel.description}</div>
                  <div className="text-xs text-blue-400">{channel.id}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* VK группы */}
      <div>
        <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          VKontakte
        </h4>
        <div className="space-y-2">
          {PRESET_CHANNELS.vk.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel('vk', channel.id, channel.name)}
              className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {channel.icon}
                <div>
                  <div className="font-medium text-white">{channel.name}</div>
                  <div className="text-xs text-gray-400">{channel.description}</div>
                  <div className="text-xs text-blue-400">{channel.id}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        💡 Нажмите на канал для быстрого выбора
      </div>
    </div>
  );
}

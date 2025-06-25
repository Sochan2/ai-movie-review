"use client";

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EmotionTag {
  id: string;
  label: string;
  color: string;
}

interface EmotionTagSelectorProps {
  emotions: EmotionTag[];
  selectedEmotions: string[];
  onChange: (value: string[]) => void;
}

export function EmotionTagSelector({
  emotions,
  selectedEmotions,
  onChange,
}: EmotionTagSelectorProps) {
  const toggleEmotion = (emotionId: string) => {
    if (selectedEmotions.includes(emotionId)) {
      onChange(selectedEmotions.filter(id => id !== emotionId));
    } else {
      onChange([...selectedEmotions, emotionId]);
    }
  };

  const getTagClassNames = (emotion: EmotionTag) => {
    const isSelected = selectedEmotions.includes(emotion.id);
    
    const baseColors = {
      'red': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      'pink': 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
    };
    
    const selectedColors = {
      'red': 'bg-red-500 text-white border-red-500 hover:bg-red-600',
      'blue': 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
      'green': 'bg-green-500 text-white border-green-500 hover:bg-green-600',
      'yellow': 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600',
      'purple': 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600',
      'pink': 'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
    };
    
    const color = emotion.color as keyof typeof baseColors;
    
    return isSelected 
      ? selectedColors[color] || selectedColors.blue
      : baseColors[color] || baseColors.blue;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map((emotion) => (
        <Badge
          key={emotion.id}
          variant="outline"
          className={cn(
            "cursor-pointer transition-colors h-8 px-3 py-1",
            getTagClassNames(emotion)
          )}
          onClick={() => toggleEmotion(emotion.id)}
        >
          {emotion.label}
        </Badge>
      ))}
    </div>
  );
}
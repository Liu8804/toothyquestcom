import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { stories as storiesEn, Story } from '@/data/stories';
import { storiesEs } from '@/data/stories-es';

export const useStories = (): Story[] => {
  const { i18n } = useTranslation();
  
  const localizedStories = useMemo(() => {
    return i18n.language === 'es' ? storiesEs : storiesEn;
  }, [i18n.language]);
  
  return localizedStories;
};

export const useStory = (storyId: string): Story | undefined => {
  const stories = useStories();
  return useMemo(() => stories.find(s => s.id === storyId), [stories, storyId]);
};

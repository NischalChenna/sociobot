export interface BusinessProfile {
  name: string;
  logo?: string;
  description: string;
  industry: string;
}

export interface Festival {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
  relevantTo: string[];
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  imagePrompts: string[];
  festival: Festival;
}

export interface ScheduledPost {
  id: string;
  content: GeneratedContent;
  selectedImagePrompt: string;
  platforms: ('twitter' | 'instagram')[];
  scheduledDate: string;
  timezone: string;
  status: 'pending' | 'posted' | 'failed';
  festival?: Festival;
}

export type AppStep = 'profile' | 'generate' | 'schedule' | 'dashboard';
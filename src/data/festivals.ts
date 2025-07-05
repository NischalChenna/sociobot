import { Festival } from '../types';

export const festivals: Festival[] = [
  {
    id: 'diwali-2024',
    name: 'Diwali',
    date: '2024-11-01',
    type: 'Hindu Festival',
    description: 'Festival of Lights celebrating the victory of light over darkness',
    relevantTo: ['food', 'retail', 'hospitality', 'general']
  },
  {
    id: 'christmas-2024',
    name: 'Christmas',
    date: '2024-12-25',
    type: 'Christian Holiday',
    description: 'Christian celebration of the birth of Jesus Christ',
    relevantTo: ['food', 'retail', 'hospitality', 'general']
  },
  {
    id: 'new-year-2025',
    name: 'New Year',
    date: '2025-01-01',
    type: 'Global Holiday',
    description: 'Celebration of the beginning of the new year',
    relevantTo: ['food', 'retail', 'hospitality', 'general', 'fitness']
  },
  {
    id: 'valentine-2025',
    name: "Valentine's Day",
    date: '2025-02-14',
    type: 'Romantic Holiday',
    description: 'Day celebrating love and romance',
    relevantTo: ['food', 'retail', 'hospitality', 'general']
  },
  {
    id: 'holi-2025',
    name: 'Holi',
    date: '2025-03-14',
    type: 'Hindu Festival',
    description: 'Festival of Colors celebrating the arrival of spring',
    relevantTo: ['food', 'retail', 'hospitality', 'general']
  },
  {
    id: 'easter-2025',
    name: 'Easter',
    date: '2025-04-20',
    type: 'Christian Holiday',
    description: 'Christian celebration of the resurrection of Jesus Christ',
    relevantTo: ['food', 'retail', 'hospitality', 'general']
  }
];

export const getUpcomingFestivals = (limit: number = 3): Festival[] => {
  const today = new Date();
  return festivals
    .filter(festival => new Date(festival.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
};

export const getRelevantFestivals = (industry: string, limit: number = 3): Festival[] => {
  const upcoming = getUpcomingFestivals(10);
  return upcoming
    .filter(festival => 
      festival.relevantTo.includes(industry.toLowerCase()) || 
      festival.relevantTo.includes('general')
    )
    .slice(0, limit);
};
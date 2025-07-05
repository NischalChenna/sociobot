import { BusinessProfile, Festival, GeneratedContent } from '../types';

const hashtagSets = {
  diwali: ['#Diwali', '#FestivalOfLights', '#DiwaliSpecial', '#Celebration', '#Joy', '#Tradition'],
  christmas: ['#Christmas', '#Holiday', '#ChristmasSpecial', '#Festive', '#Joy', '#Celebration'],
  'new-year': ['#NewYear', '#2025', '#NewBeginnings', '#Celebration', '#Cheers', '#Resolution'],
  valentine: ['#ValentinesDay', '#Love', '#Romance', '#Special', '#Couple', '#DateNight'],
  holi: ['#Holi', '#FestivalOfColors', '#HoliSpecial', '#Colors', '#Spring', '#Celebration'],
  easter: ['#Easter', '#Spring', '#EasterSpecial', '#Celebration', '#Joy', '#Holiday']
};

const industryHashtags = {
  food: ['#Foodie', '#Delicious', '#Yummy', '#FreshFood', '#LocalEats'],
  retail: ['#Shopping', '#SpecialOffer', '#Style', '#Fashion', '#Deals'],
  hospitality: ['#Hospitality', '#Service', '#Experience', '#Welcome', '#Comfort'],
  general: ['#Local', '#Community', '#Business', '#Quality', '#Service']
};

export const generateContent = (profile: BusinessProfile, festival: Festival): GeneratedContent => {
  const festivalKey = festival.name.toLowerCase().replace(/[^a-z]/g, '-');
  const industryKey = profile.industry.toLowerCase();
  
  // Generate caption based on business type and festival
  const captions = {
    food: {
      diwali: `✨ Light up your taste buds this Diwali! ${profile.name} brings you authentic flavors that celebrate the festival of lights. Join us for a spectacular culinary journey! 🪔`,
      christmas: `🎄 Taste the magic of Christmas at ${profile.name}! Our festive menu is crafted with love and holiday spirit. Make your celebrations memorable! ⭐`,
      'new-year': `🎊 Ring in 2025 with delicious beginnings at ${profile.name}! Start your year with flavors that inspire and energize. Cheers to new adventures! 🥂`,
      valentine: `💕 Love is in the air and on your plate! ${profile.name} creates the perfect romantic dining experience for you and your special someone. ❤️`,
      holi: `🌈 Splash into spring with vibrant flavors at ${profile.name}! Our colorful menu celebrates the joy of Holi. Let's paint the town delicious! 🎨`,
      easter: `🐰 Hop into spring with fresh flavors at ${profile.name}! Our Easter specials bring renewal and joy to every bite. Celebrate new beginnings! 🌸`
    },
    retail: {
      diwali: `✨ Illuminate your style this Diwali! ${profile.name} presents exclusive collections that shine as bright as your celebrations. Shop the festival magic! 🪔`,
      christmas: `🎁 Unwrap the perfect gifts at ${profile.name}! Our Christmas collection brings joy, style, and memories that last forever. Holiday shopping made special! 🎄`,
      'new-year': `🎊 Step into 2025 with style! ${profile.name} launches the new year with fresh collections and exciting possibilities. Your new chapter starts here! ✨`,
      valentine: `💝 Express your love with thoughtful gifts from ${profile.name}! Find the perfect way to say 'I love you' with our Valentine's collection. 💕`,
      holi: `🌈 Add color to your wardrobe this Holi! ${profile.name} brings vibrant collections that celebrate the festival of colors. Shop the rainbow! 🎨`,
      easter: `🌸 Spring into style with ${profile.name}! Our Easter collection brings fresh looks and renewed confidence. Celebrate the season of bloom! 🐰`
    },
    general: {
      diwali: `✨ ${profile.name} wishes you a Diwali filled with light, joy, and prosperity! Thank you for being part of our community. Let's celebrate together! 🪔`,
      christmas: `🎄 The team at ${profile.name} sends warm Christmas wishes to you and your loved ones! May your holidays be merry and bright! ⭐`,
      'new-year': `🎊 ${profile.name} welcomes 2025 with gratitude and excitement! Thank you for your continued support. Here's to new achievements together! 🥂`,
      valentine: `💕 Spreading love and appreciation from all of us at ${profile.name}! Thank you for choosing us. You make our business family complete! ❤️`,
      holi: `🌈 ${profile.name} celebrates the colors of joy with our amazing community! May this Holi bring happiness and new beginnings to all! 🎨`,
      easter: `🌸 ${profile.name} wishes you a blessed Easter filled with hope, renewal, and joy! Thank you for being part of our journey! 🐰`
    }
  };

  const fallbackCaption = `🎉 ${profile.name} celebrates ${festival.name} with our amazing community! Join us in the festivities and create beautiful memories together! ✨`;
  
  const caption = captions[industryKey]?.[festivalKey] || fallbackCaption;
  
  // Generate hashtags
  const festivalHashtags = hashtagSets[festivalKey] || ['#Festival', '#Celebration'];
  const businessHashtags = industryHashtags[industryKey] || industryHashtags.general;
  const businessTag = `#${profile.name.replace(/\s+/g, '')}`;
  
  const hashtags = [
    ...festivalHashtags.slice(0, 3),
    ...businessHashtags.slice(0, 2),
    businessTag
  ];

  // Generate image prompts
  const imagePrompts = [
    `A vibrant ${festival.name} themed image featuring ${profile.description.toLowerCase()}, with warm lighting and festive decorations, professional food photography style`,
    `Modern ${festival.name} celebration setup with ${profile.industry.toLowerCase()} elements, colorful and inviting atmosphere, high-quality commercial photography`,
    `Elegant ${festival.name} display showcasing ${profile.name}'s offerings, with traditional festival colors and contemporary styling, marketing photography`
  ];

  return {
    caption,
    hashtags,
    imagePrompts,
    festival
  };
};
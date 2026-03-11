export interface SeasonalTheme {
  name: string;
  nameTh: string;
  emoji: string[];
  gradient: string;
  animation: string;
  badgeColors: string;
  overlayColors: string;
  cardBorder: string;
  cardBg: string;
  description: string;
  iconComponent: string[];
}

export const seasonalThemes: Record<string, SeasonalTheme> = {
  spring: {
    name: 'Spring',
    nameTh: 'ฤดูใบไม้ผลิ',
    emoji: ['🌸', '🌺', '🌷', '🌼'],
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 25%, #FFE4E1 50%, #FFF0F5 75%, #F0E68C 100%)',
    animation: 'springGradient 12s ease infinite',
    badgeColors: 'from-pink-400 to-rose-500',
    overlayColors: 'from-pink-200/30 to-transparent',
    cardBorder: 'border-pink-200/50',
    cardBg: 'from-pink-50/40 to-rose-50/20',
    description: 'สินค้าราคาพิเศษ • ต้อนรับฤดูใบไม้ผลิอันสดใส! 🌸',
    iconComponent: ['Flower', 'Leaf', 'Sparkles']
  },
  summer: {
    name: 'Summer',
    nameTh: 'ฤดูร้อน',
    emoji: ['☀️', '🌊', '🏖️', '🌴'],
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #45B7D1 75%, #96CEB4 100%)',
    animation: 'summerGradient 15s ease infinite',
    badgeColors: 'from-yellow-400 to-orange-500',
    overlayColors: 'from-yellow-400/20 to-transparent',
    cardBorder: 'border-yellow-200/50',
    cardBg: 'from-yellow-50/40 to-orange-50/20',
    description: 'สินค้าราคาพิเศษ สำหรับคุณเท่านั้น • พลาดไม่ได้ในฤดูร้อนนี้! 🏖️',
    iconComponent: ['Sun', 'Waves', 'Sparkles']
  },
  autumn: {
    name: 'Autumn',
    nameTh: 'ฤดูใบไม้ร่วง',
    emoji: ['🍂', '🍁', '🎃', '🌰'],
    gradient: 'linear-gradient(135deg, #D2691E 0%, #FF8C00 25%, #CD853F 50%, #8B4513 75%, #A0522D 100%)',
    animation: 'autumnGradient 10s ease infinite',
    badgeColors: 'from-orange-500 to-amber-600',
    overlayColors: 'from-orange-300/25 to-transparent',
    cardBorder: 'border-orange-200/50',
    cardBg: 'from-orange-50/40 to-amber-50/20',
    description: 'สินค้าราคาพิเศษ • อบอุ่นในฤดูใบไม้ร่วง! 🍂',
    iconComponent: ['Leaf', 'Wind', 'Sparkles']
  },
  winter: {
    name: 'Winter',
    nameTh: 'ฤดูหนาว',
    emoji: ['❄️', '⛄', '🎿', '🧣'],
    gradient: 'linear-gradient(135deg, #B0E0E6 0%, #87CEEB 25%, #4682B4 50%, #1E90FF 75%, #F0F8FF 100%)',
    animation: 'winterGradient 8s ease infinite',
    badgeColors: 'from-blue-400 to-cyan-500',
    overlayColors: 'from-blue-200/25 to-transparent',
    cardBorder: 'border-blue-200/50',
    cardBg: 'from-blue-50/40 to-cyan-50/20',
    description: 'สินค้าราคาพิเศษ • อบอุ่นในฤดูหนาวนี้! ❄️',
    iconComponent: ['Snowflake', 'Wind', 'Sparkles']
  }
};

export const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

export const getSeasonFromPromoTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('ใบไม้ผลิ') || lowerTitle.includes('spring')) return 'spring';
  if (lowerTitle.includes('ร้อน') || lowerTitle.includes('summer')) return 'summer';
  if (lowerTitle.includes('ใบไม้ร่วง') || lowerTitle.includes('autumn') || lowerTitle.includes('ฤดูใบไม้ร่วง')) return 'autumn';
  if (lowerTitle.includes('หนาว') || lowerTitle.includes('winter')) return 'winter';
  return getCurrentSeason();
};

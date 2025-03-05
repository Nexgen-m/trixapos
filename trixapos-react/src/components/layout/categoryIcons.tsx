// categoryIcons.ts - A file to store category to emoji mappings

/**
 * Map of keywords to emoji icons for categories
 * Used to dynamically assign icons based on category names
 */
export const keywordToEmoji: Record<string, string> = {
  // Electronics related
  "electronic": "💻",
  "laptop": "💻",
  "computer": "🖥️",
  "phone": "📱",
  "mobile": "📱",
  "tablet": "📱",
  "accessory": "🔌",
  "gadget": "🔌",
  "camera": "📷",
  "audio": "🎧",
  "headphone": "🎧",
  "tv": "📺",
  "television": "📺",
  
  // Fashion related
  "fashion": "👕",
  "clothing": "👚",
  "wear": "👔",
  "apparel": "👗",
  "shirt": "👕",
  "pant": "👖",
  "dress": "👗",
  "shoe": "👞",
  "footwear": "👟",
  "jewelry": "💍",
  "watch": "⌚",
  
  // Home & Living
  "home": "🏠",
  "house": "🏡",
  "furniture": "🪑",
  "kitchen": "🍳",
  "appliance": "🧰",
  "decor": "🏺",
  "garden": "🌱",
  "living": "🛋️",
  "bedroom": "🛏️",
  "bathroom": "🚿",
  
  // Books & Media
  "book": "📚",
  "novel": "📖",
  "literature": "📚",
  "magazine": "📰",
  "media": "📀",
  "music": "🎵",
  "movie": "🎬",
  "game": "🎮",
  "video": "📹",
  
  // Sports & Outdoors
  "sport": "⚽",
  "outdoor": "🏕️",
  "fitness": "🏋️",
  "exercise": "🏃",
  "camping": "⛺",
  "bicycle": "🚲",
  "bike": "🚲",
  
  // Health & Beauty
  "health": "❤️",
  "beauty": "💄",
  "cosmetic": "💋",
  "makeup": "💅",
  "skincare": "🧴",
  "medicine": "💊",
  "vitamin": "💉",
  
  // Food & Grocery
  "food": "🍔",
  "grocery": "🛒",
  "fruit": "🍎",
  "vegetable": "🥦",
  "meat": "🥩",
  "beverage": "🥤",
  "drink": "🍹",
  
  // Default for unknown categories
  "default": "📦"
};

/**
 * Get an appropriate emoji for a category based on its name
 * @param categoryName - The name of the category
 * @returns An emoji character representing the category
 */
export function getCategoryEmoji(categoryName: string): string {
  // Normalize category name
  const normalizedName = categoryName.toLowerCase();
  
  // Check each keyword against the category name
  for (const [keyword, emoji] of Object.entries(keywordToEmoji)) {
    if (normalizedName.includes(keyword)) {
      return emoji;
    }
  }
  
  // Return default emoji if no match is found
  return keywordToEmoji.default;
}
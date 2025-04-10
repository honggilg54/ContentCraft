import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, format, formatDistanceToNow, isBefore, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd', { locale: ko });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}

// Get days until expiration
export function getDaysUntilExpiration(expirationDate: Date | string): number {
  const expDate = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return differenceInDays(expDate, today);
}

// Format days until expiration as "D-X"
export function formatDaysUntilExpiration(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "만료됨";
  }
  
  return `D-${days}`;
}

// Determine the status color based on days until expiration
export function getExpirationColor(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "border-gray-400"; // Expired
  } else if (days <= 1) {
    return "border-rose-600"; // Danger - 1 day or less
  } else if (days <= 3) {
    return "border-amber-600"; // Warning - 3 days or less
  } else {
    return "border-emerald-600"; // Primary - more than 3 days
  }
}

export function getProgressColor(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "bg-gray-400"; // Expired
  } else if (days <= 1) {
    return "bg-rose-600"; // Danger - 1 day or less
  } else if (days <= 3) {
    return "bg-amber-600"; // Warning - 3 days or less
  } else {
    return "bg-emerald-600"; // Primary - more than 3 days
  }
}

export function getIndicatorBgColor(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "bg-gray-500 text-white"; // Expired
  } else if (days <= 1) {
    return "bg-rose-600 text-white"; // Danger - 1 day or less
  } else if (days <= 3) {
    return "bg-amber-600 text-white"; // Warning - 3 days or less
  } else {
    return "bg-emerald-600 text-white"; // Primary - more than 3 days
  }
}

export function getIconBgColor(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "bg-gray-100"; // Expired
  } else if (days <= 1) {
    return "bg-rose-100"; // Danger - 1 day or less
  } else if (days <= 3) {
    return "bg-amber-100"; // Warning - 3 days or less
  } else {
    return "bg-emerald-100"; // Primary - more than 3 days
  }
}

export function getIconColor(expirationDate: Date | string): string {
  const days = getDaysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return "text-gray-500"; // Expired
  } else if (days <= 1) {
    return "text-rose-600"; // Danger - 1 day or less
  } else if (days <= 3) {
    return "text-amber-600"; // Warning - 3 days or less
  } else {
    return "text-emerald-600"; // Primary - more than 3 days
  }
}

// Food icon mapping
export function getFoodIcon(category: string, name: string): string {
  // Default to food icon based on category
  const categoryIcons: Record<string, string> = {
    refrigerated: "kitchen",
    frozen: "ac_unit",
    fruits_vegetables: "eco",
    meat: "restaurant",
    dairy: "local_drink",
    other: "kitchen",
  };
  
  // Specific food item mapping
  const nameToIcon: Record<string, string> = {
    계란: "egg",
    우유: "local_drink",
    요거트: "kitchen",
    치킨: "restaurant",
    식빵: "bakery_dining",
    사과: "apple",
    바나나: "water",
    고기: "lunch_dining",
    생선: "set_meal",
    햄: "tapas",
    주스: "local_cafe",
    케이크: "cake",
  };
  
  // Check if we have a specific icon for this food name
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(nameToIcon)) {
    if (lowerName.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Fallback to category-based icon
  return categoryIcons[category] || "restaurant_menu";
}

// Local storage utilities
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return defaultValue;
  }
}

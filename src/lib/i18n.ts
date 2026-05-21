export const translations = {
  vi: {
    categories: {
      all: "Tất cả",
      truyen_thong: "Truyền thống",
      thien_nhien: "Thiên nhiên",
      hien_dai: "Hiện đại",
      lang_man: "Lãng mạn",
      co_phuc: "Cổ điển",
      sang_trong: "Sang trọng",
      toi_gian: "Tối giản",
      typography: "Typography",
      de_thuong: "Dễ thương",
    },
    invitation: {
      title: "Lời mời cưới",
      subtitle: "You're invited to our special day",
      viewDetails: "Xem chi tiết",
      sentTo: "Lời mời này được gửi đến",
    },
    events: {
      date: "Ngày",
      time: "Giờ",
      venue: "Địa điểm",
      address: "Địa chỉ",
    },
  },
  en: {
    categories: {
      all: "All",
      truyen_thong: "Traditional",
      thien_nhien: "Nature",
      hien_dai: "Modern",
      lang_man: "Romantic",
      co_phuc: "Classic",
      sang_trong: "Luxury",
      toi_gian: "Minimalist",
      typography: "Typography",
      de_thuong: "Cute",
    },
    invitation: {
      title: "Wedding Invitation",
      subtitle: "You're invited to our special day",
      viewDetails: "View Details",
      sentTo: "This invitation was sent to",
    },
    events: {
      date: "Date",
      time: "Time",
      venue: "Venue",
      address: "Address",
    },
  },
} as const;

export type Locale = keyof typeof translations;
export type CategoryKey = keyof typeof translations.vi.categories;

export function t(category: CategoryKey, locale: Locale = "vi"): string {
  return translations[locale].categories[category] || category;
}

export function getCategoryLabel(categoryKey: string, locale: Locale = "vi"): string {
  return (translations[locale].categories as Record<string, string>)[categoryKey] || categoryKey;
}

export function getAllCategories(locale: Locale = "vi"): Array<{ key: string; label: string }> {
  const cats = translations[locale].categories;
  return Object.entries(cats).map(([key, label]) => ({ key, label }));
}
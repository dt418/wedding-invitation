// Event Wizard Types and Constants

export const timelineTypes = [
  { value: "arrival", label: "Đón khách" },
  { value: "ceremony", label: "Lễ nghi" },
  { value: "reception", label: "Khai tiệc" },
  { value: "cake", label: "Cắt bánh" },
  { value: "dance", label: "Khiêu vũ" },
  { value: "end", label: "Kết thúc" },
  { value: "custom", label: "Tùy chỉnh" },
] as const;

export const ceremonyTypes = [
  { value: "le_nap_tai", label: "Lễ nạp tài" },
  { value: "le_vu_quy", label: "Lễ vu quy" },
  { value: "le_thanh_hon", label: "Lễ thành hôn" },
  { value: "le_dam", label: "Lễ đám" },
  { value: "le_nhao", label: "Lễ nhà hỏa" },
  { value: "other", label: "Khác" },
] as const;

export type TimelineType = typeof timelineTypes[number]["value"];
export type CeremonyType = typeof ceremonyTypes[number]["value"];

// Default timeline for wedding
export const DEFAULT_TIMELINE = [
  { time: "17:00", type: "arrival", title: "Đón khách", description: "Tiếp đón khách mời" },
  { time: "18:00", type: "ceremony", title: "Lễ nghi", description: "Lễ thành hôn" },
  { time: "18:30", type: "reception", title: "Khai tiệc", description: "Bắt đầu tiệc cưới" },
  { time: "21:00", type: "end", title: "Kết thúc", description: "Kết thúc tiệc" },
] as const;

// Default thank you note
export const DEFAULT_THANK_YOU = "Cảm ơn quý khách đã đến chia vui cùng chúng tôi. Sự hiện diện của quý khách là món quà quý nhất trong ngày trọng đại này.";
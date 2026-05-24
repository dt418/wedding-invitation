// Preview Sections Builder - Converts form data to InviteRenderer sections

import { DEFAULT_THANK_YOU } from "@/lib/schemas/event-wizard-schema";

export interface PreviewSection {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

export interface FormDataPreview {
  groomName: string;
  brideName: string;
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
  groomAddress: string;
  brideAddress: string;
  eventDate: string;
  eventTime: string;
  ceremonyTime?: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  timeline: Array<{ time: string; type: string; title: string; description: string }>;
  images: Array<{ url: string; caption: string }>;
  thankYouNote: string;
  ceremonyType: string;
  groomNickname?: string;
  brideNickname?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function buildPreviewSections(data: FormDataPreview): PreviewSection[] {
  // Classic template uses a single section with all data
  return [{
    id: generateId(),
    sectionType: "classic-invite",
    customContent: {
      groomName: data.groomName || "Chú Rể",
      brideName: data.brideName || "Cô Dâu",
      groomNickname: data.groomNickname || "Trưởng Nam",
      brideNickname: data.brideNickname || "Út Nữ",
      groomFather: data.groomFather || "",
      groomMother: data.groomMother || "",
      brideFather: data.brideFather || "",
      brideMother: data.brideMother || "",
      groomAddress: data.groomAddress || "",
      brideAddress: data.brideAddress || "",
      eventDate: data.eventDate || "",
      eventTime: data.eventTime || "",
      ceremonyTime: data.ceremonyTime || data.eventTime || "",
      venueName: data.venueName || "",
      venueAddress: data.venueAddress || "",
      mapUrl: data.mapUrl || "",
      thankYouNote: data.thankYouNote || DEFAULT_THANK_YOU,
    },
    visibility: "visible",
  }];
}
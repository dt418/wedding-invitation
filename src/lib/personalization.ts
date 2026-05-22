/**
 * Personalization Engine
 * Handles guest-specific pronouns and template variable replacement
 */

export type Gender = "male" | "female" | "other";
export type Relation = "groom_side" | "bride_side" | "friend" | "family";

export interface PronounSet {
  formal: string;       // "anh", "bà", "cô", "anh chị"
  respectful: string;   // "anh", "bà", "cô", "anh chị"
  family: string;       // "gia đình anh", "gia đình bà", "gia đình"
  salutation: string;   // "Kính mời anh", "Kính mời bà", "Kính mời cô"
}

// Detect gender from Vietnamese name (last name + common patterns)
function detectGenderFromName(name: string, relation?: Relation): Gender {
  if (relation === "groom_side") return "male";
  if (relation === "bride_side") return "female";
  
  const lowerName = name.toLowerCase();
  
  // Female markers
  const femalePatterns = [
    "thị", "vân", "linh", "hương", "trang", "phương", "thảo", "mai", 
    "ngọc", "hà", "yến", "vy", " Anh ", " Thị ", " Vân ", " Trang "
  ];
  if (femalePatterns.some(p => lowerName.includes(p))) return "female";
  
  // Male markers
  const malePatterns = [
    "minh", "hùng", "khoa", "anh", "đức", "phong", "tú", "cường",
    "văn", "nhân", "thành", "tuấn", "khánh", "việt"
  ];
  if (malePatterns.some(p => lowerName.includes(p))) return "male";
  
  return "other";
}

/**
 * Get pronouns for a guest based on their name, gender, and relation
 */
export function getGuestPronouns(
  name: string,
  gender?: Gender | null,
  relation?: Relation | null
): PronounSet {
  const detectedGender = gender || detectGenderFromName(name, relation || undefined);
  
  // Friend-specific pronouns (use "bạn" instead of "anh/cô")
  if (relation === "friend") {
    return {
      formal: "bạn",
      respectful: "bạn",
      family: "gia đình bạn",
      salutation: "Kính mời bạn",
    };
  }
  
  // Family can be mixed gender
  if (relation === "family") {
    return {
      formal: "anh chị em",
      respectful: "anh chị em",
      family: "gia đình",
      salutation: "Kính mời anh chị em",
    };
  }
  
  switch (detectedGender) {
    case "male":
      return {
        formal: "anh",
        respectful: "anh",
        family: "gia đình anh",
        salutation: "Kính mời anh",
      };
    
    case "female":
      return {
        formal: "cô",
        respectful: "bà",
        family: "gia đình cô",
        salutation: "Kính mời cô",
      };
    
    default:
      return {
        formal: "anh chị",
        respectful: "anh chị",
        family: "gia đình",
        salutation: "Kính mời anh chị",
      };
  }
}

/**
 * Format full salutation with guest name
 * @example "Kính mời anh Nguyễn Văn A"
 */
export function formatSalutation(
  pronouns: PronounSet,
  guestName: string
): string {
  return `${pronouns.salutation} ${guestName}`;
}

/**
 * Format family salutation
 * @example "Kính mời gia đình anh Minh"
 */
export function formatFamilySalutation(
  pronouns: PronounSet,
  familyName?: string
): string {
  if (familyName) {
    return `${pronouns.salutation.replace("Kính mời", "Kính mời")} ${pronouns.family} ${familyName}`;
  }
  return `Kính mời ${pronouns.family}`;
}

export interface TemplateVariables {
  GUEST_NAME: string;
  GUEST_PRONOUN: string;
  GUEST_PRONOUN_FULL: string;
  COUPLE_NAMES: string;
  GROOM_NAME: string;
  BRIDE_NAME: string;
  EVENT_DATE: string;
  EVENT_TIME: string;
  VENUE_NAME: string;
  VENUE_ADDRESS: string;
  MAP_URL: string;
  INVITE_CODE: string;
  INVITE_URL: string;
  THANK_YOU_NOTE: string;
  TIMELINE: string;
  GROOM_BANK?: string;
  GROOM_ACCOUNT?: string;
  BRIDE_BANK?: string;
  BRIDE_ACCOUNT?: string;
}

export interface EventData {
  title?: string | null;
  groomName?: string | null;
  brideName?: string | null;
  eventDate?: string | Date | null;
  eventTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  mapUrl?: string | null;
  eventContent?: {
    groomName?: string;
    brideName?: string;
    groomFather?: string;
    groomMother?: string;
    brideFather?: string;
    brideMother?: string;
    groomAddress?: string;
    brideAddress?: string;
    ceremonyType?: string;
    timeline?: Array<{ time: string; type: string; title: string; description: string }>;
    images?: Array<{ url: string; caption: string }>;
    thankYouNote?: string;
    groomBank?: string;
    groomAccount?: string;
    brideBank?: string;
    brideAccount?: string;
  };
}

export interface GuestData {
  name: string;
  gender?: Gender | null;
  relation?: Relation | null;
}

/**
 * Build template variables for a specific invite
 */
export function buildTemplateVariables(
  eventData: EventData,
  guestData: GuestData,
  inviteCode: string,
  baseUrl: string
): TemplateVariables {
  const pronouns = getGuestPronouns(guestData.name, guestData.gender, guestData.relation);
  
  // Extract data from eventContent or fallback to event fields
  const ec = eventData.eventContent || {};
  const groomName = ec.groomName || eventData.groomName || eventData.title?.split(" & ")[0] || "";
  const brideName = ec.brideName || eventData.brideName || eventData.title?.split(" & ")[1] || "";
  
  // Format date
  let eventDate = "";
  if (eventData.eventDate) {
    if (eventData.eventDate instanceof Date) {
      eventDate = eventData.eventDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      eventDate = eventData.eventDate;
    }
  }
  
  // Format timeline
  const timeline = ec.timeline
    ?.map((t) => `${t.time} - ${t.title}`)
    .join("\n") || "";

  return {
    GUEST_NAME: guestData.name,
    GUEST_PRONOUN: pronouns.formal,
    GUEST_PRONOUN_FULL: formatSalutation(pronouns, guestData.name),
    COUPLE_NAMES: groomName && brideName ? `${groomName} & ${brideName}` : groomName || brideName || eventData.title || "",
    GROOM_NAME: groomName,
    BRIDE_NAME: brideName,
    EVENT_DATE: eventDate,
    EVENT_TIME: eventData.eventTime || "",
    VENUE_NAME: eventData.venueName || "",
    VENUE_ADDRESS: eventData.venueAddress || "",
    MAP_URL: eventData.mapUrl || "",
    INVITE_CODE: inviteCode,
    INVITE_URL: `${baseUrl}/invite/${inviteCode}`,
    THANK_YOU_NOTE: ec.thankYouNote || "Cảm ơn quý khách đã đến chia vui cùng chúng tôi!",
    TIMELINE: timeline,
    GROOM_BANK: ec.groomBank,
    GROOM_ACCOUNT: ec.groomAccount,
    BRIDE_BANK: ec.brideBank,
    BRIDE_ACCOUNT: ec.brideAccount,
  };
}

/**
 * Replace template variables in a string
 * @example replaceTemplateVars("Hello {{GUEST_NAME}}!", { GUEST_NAME: "Minh" })
 * @returns "Hello Minh!"
 */
export function replaceTemplateVars(
  template: string,
  vars: TemplateVariables
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value ?? "");
  }
  
  return result;
}

/**
 * Check if a template has unresolved variables
 */
export function hasUnresolvedVars(template: string): boolean {
  return /\{\{[^}]+\}\}/.test(template);
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, invites, guests, templates, templateVariants, templateSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildTemplateVariables, getGuestPronouns, formatSalutation, replaceTemplateVars } from "@/lib/personalization";

/**
 * GET /api/invites/[code]/html
 * Generate complete HTML for a wedding invitation using template sections
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Fetch invite
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.inviteCode, code))
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Fetch guest
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, invite.guestId))
    .limit(1);

  // Fetch event
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, invite.eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch template
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, event.templateId))
    .limit(1);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Fetch variant
  const [variant] = await db
    .select()
    .from(templateVariants)
    .where(eq(templateVariants.templateId, template.id))
    .limit(1);

  // Fetch event sections
  const sections = await db
    .select()
    .from(templateSections)
    .where(eq(templateSections.eventId, event.id));

  // Build personalization variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const templateVars = buildTemplateVariables(
    {
      title: event.title,
      groomName: event.groomName,
      brideName: event.brideName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      mapUrl: event.mapUrl,
      eventContent: event.eventContent as Record<string, unknown> | undefined,
    },
    {
      name: guest?.name || "",
      gender: guest?.gender as "male" | "female" | "other" | null,
      relation: guest?.relation as "groom_side" | "bride_side" | "friend" | "family" | null,
    },
    invite.inviteCode,
    baseUrl
  );

  // Get personalized greeting
  const pronouns = getGuestPronouns(
    guest?.name || "",
    guest?.gender as "male" | "female" | "other" | null,
    guest?.relation as "groom_side" | "bride_side" | "friend" | "family" | null
  );
  const personalizedGreeting = formatSalutation(pronouns, guest?.name || "");

  // Get color tokens
  const colors = variant?.colorTokens as Record<string, string> || {
    primary: "#d4a574",
    secondary: "#c9956c",
    background: "#faf7f4",
    text: "#333333",
  };

  // Format date
  const eventDateObj = event.eventDate;
  const eventDateStr = eventDateObj
    ? new Date(eventDateObj).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  // Process sections with personalization
  const processedSections = sections.map((section) => {
    const content = section.customContent as Record<string, unknown> || {};
    const processed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string") {
        processed[key] = replaceTemplateVars(value, templateVars);
      } else if (Array.isArray(value)) {
        processed[key] = value.map((item) => {
          if (typeof item === "string") return replaceTemplateVars(item, templateVars);
          if (typeof item === "object" && item !== null) {
            const processedItem: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(item)) {
              processedItem[k] = typeof v === "string" ? replaceTemplateVars(v, templateVars) : v;
            }
            return processedItem;
          }
          return item;
        });
      } else {
        processed[key] = value;
      }
    }

    return {
      ...section,
      customContent: processed,
    };
  });

  // Extract section content by type
  const sectionContent: Record<string, Record<string, unknown>> = {};
  for (const section of processedSections) {
    sectionContent[section.sectionType] = section.customContent as Record<string, unknown>;
  }

  // Build complete HTML using template sections
  const html = generateWeddingInviteHtml({
    templateName: template.name,
    templateSlug: template.slug,
    colors,
    personalizedGreeting,
    coupleNames: templateVars.COUPLE_NAMES,
    groomName: templateVars.GROOM_NAME,
    brideName: templateVars.BRIDE_NAME,
    eventDate: eventDateStr || templateVars.EVENT_DATE,
    eventTime: templateVars.EVENT_TIME,
    venueName: templateVars.VENUE_NAME,
    venueAddress: templateVars.VENUE_ADDRESS,
    mapUrl: templateVars.MAP_URL,
    inviteUrl: templateVars.INVITE_URL,
    // Use sections or fallback to eventContent
    timeline: (sectionContent.timeline?.items as Array<{ time: string; type: string; title: string; description?: string }>) 
      || event.eventContent?.timeline 
      || [],
    thankYouNote: sectionContent.thankYou?.note as string || templateVars.THANK_YOU_NOTE,
    groomBank: sectionContent.bankInfo?.groomBank as string || templateVars.GROOM_BANK,
    groomAccount: sectionContent.bankInfo?.groomAccount as string || templateVars.GROOM_ACCOUNT,
    brideBank: sectionContent.bankInfo?.brideBank as string || templateVars.BRIDE_BANK,
    brideAccount: sectionContent.bankInfo?.brideAccount as string || templateVars.BRIDE_ACCOUNT,
    qrCodeUrl: invite.qrCodeUrl || undefined,
    // Pass all processed sections for HTML generation
    sections: processedSections,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

interface WeddingInviteOptions {
  templateName: string;
  templateSlug: string;
  colors: Record<string, string>;
  personalizedGreeting: string;
  coupleNames: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  inviteUrl: string;
  timeline: Array<{ time: string; type: string; title: string; description?: string }>;
  thankYouNote: string;
  groomBank?: string;
  groomAccount?: string;
  brideBank?: string;
  brideAccount?: string;
  qrCodeUrl?: string;
  sections?: Array<{
    sectionType: string;
    order: number;
    visibility: string;
    customContent: Record<string, unknown>;
  }>;
}

function generateWeddingInviteHtml(opts: WeddingInviteOptions): string {
  const { colors, personalizedGreeting, coupleNames, groomName, brideName, sections } = opts;

  // Generate sections HTML based on template sections
  let sectionsHtml = "";
  
  if (sections && sections.length > 0) {
    // Sort by order and filter visible sections
    const visibleSections = sections
      .filter(s => s.visibility !== "hidden")
      .sort((a, b) => a.order - b.order);

    for (const section of visibleSections) {
      const content = section.customContent || {};
      
      switch (section.sectionType) {
        case "greeting":
          // Already rendered in main greeting
          break;
        case "couple":
          sectionsHtml += `
            <div class="section couple-section">
              <h3>${content.subtitle || "Cặp Đôi"}</h3>
              <div class="couple-names">${content.names || coupleNames}</div>
              <p>${content.description || ""}</p>
            </div>
          `;
          break;
        case "event":
          sectionsHtml += `
            <div class="section event-details">
              <h3>${content.subtitle || "Ngày Cưới"}</h3>
              <div class="date">${opts.eventDate}</div>
              ${opts.eventTime ? `<div class="time">${opts.eventTime}</div>` : ""}
              <h3>${content.venueLabel || "Địa Điểm"}</h3>
              <div class="venue">${opts.venueName}</div>
              <div class="address">${opts.venueAddress}</div>
              ${opts.mapUrl ? `<a href="${opts.mapUrl}" target="_blank" class="map-link">📍 Xem Bản Đồ</a>` : ""}
            </div>
          `;
          break;
        case "timeline":
          if (opts.timeline.length > 0) {
            sectionsHtml += `
              <div class="section">
                <h3>${content.subtitle || "Thời Gian Trọng Đại"}</h3>
                <div class="timeline">
                  ${opts.timeline.map(t => `
                    <div class="timeline-item">
                      <div class="timeline-time">${t.time}</div>
                      <div class="timeline-content">
                        <strong>${t.title}</strong>
                        ${t.description ? `<p>${t.description}</p>` : ""}
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }
          break;
        case "bankInfo":
          if (opts.groomBank || opts.brideBank) {
            sectionsHtml += `
              <div class="section bank-info">
                <h3>${content.subtitle || "Hướng Dẫn"}</h3>
                ${opts.groomBank && opts.groomAccount ? `
                  <div class="bank-entry">
                    <strong>${opts.groomName}</strong>
                    <p>STK: ${opts.groomAccount}</p>
                    <p>Ngân hàng: ${opts.groomBank}</p>
                  </div>
                ` : ""}
                ${opts.brideBank && opts.brideAccount ? `
                  <div class="bank-entry">
                    <strong>${opts.brideName}</strong>
                    <p>STK: ${opts.brideAccount}</p>
                    <p>Ngân hàng: ${opts.brideBank}</p>
                  </div>
                ` : ""}
              </div>
            `;
          }
          break;
        case "thankYou":
          sectionsHtml += `
            <div class="thank-you">
              <p>${content.note || opts.thankYouNote}</p>
            </div>
          `;
          break;
        case "gallery":
          // Gallery section placeholder
          if (content.images && Array.isArray(content.images)) {
            sectionsHtml += `
              <div class="section gallery">
                <h3>${content.subtitle || "Hình Ảnh"}</h3>
                <div class="gallery-grid">
                  ${(content.images as Array<{ url: string; caption?: string }>).map(img => `
                    <img src="${img.url}" alt="${img.caption || ""}" />
                  `).join("")}
                </div>
              </div>
            `;
          }
          break;
        default:
          // Custom section
          if (content.title || content.description) {
            sectionsHtml += `
              <div class="section custom-section">
                ${content.title ? `<h3>${content.title}</h3>` : ""}
                <p>${content.description || ""}</p>
              </div>
            `;
          }
      }
    }
  }

  // Timeline HTML (fallback if no sections)
  const timelineHtml = opts.timeline.length > 0 && !sections?.some(s => s.sectionType === "timeline")
    ? opts.timeline.map(t => `
        <div class="timeline-item">
          <div class="timeline-time">${t.time}</div>
          <div class="timeline-content">
            <strong>${t.title}</strong>
            ${t.description ? `<p>${t.description}</p>` : ""}
          </div>
        </div>
      `).join("")
    : "";

  // Bank info HTML (fallback)
  const bankInfoHtml = ((opts.groomBank && opts.groomAccount) || (opts.brideBank && opts.brideAccount)) && !sections?.some(s => s.sectionType === "bankInfo")
    ? `
      <div class="section bank-info">
        <h3>Hướng Dẫn</h3>
        ${opts.groomBank && opts.groomAccount ? `
          <div class="bank-entry">
            <strong>${opts.groomName}</strong>
            <p>STK: ${opts.groomAccount}</p>
            <p>Ngân hàng: ${opts.groomBank}</p>
          </div>
        ` : ""}
        ${opts.brideBank && opts.brideAccount ? `
          <div class="bank-entry">
            <strong>${opts.brideName}</strong>
            <p>STK: ${opts.brideAccount}</p>
            <p>Ngân hàng: ${opts.brideBank}</p>
          </div>
        ` : ""}
      </div>
    `
    : "";

  // QR code HTML
  const qrHtml = opts.qrCodeUrl
    ? `<div class="qr-section"><img src="${opts.qrCodeUrl}" alt="QR Code" class="qr-code" /></div>`
    : "";

  // If no sections, use default layout
  const defaultLayout = !sections || sections.length === 0;
  const defaultSectionsHtml = defaultLayout ? `
    <div class="section event-details">
      <h3>Ngày Cưới</h3>
      <div class="date">${opts.eventDate}</div>
      ${opts.eventTime ? `<div class="time">${opts.eventTime}</div>` : ""}
      <h3>Địa Điểm</h3>
      <div class="venue">${opts.venueName}</div>
      <div class="address">${opts.venueAddress}</div>
      ${opts.mapUrl ? `<a href="${opts.mapUrl}" target="_blank" class="map-link">📍 Xem Bản Đồ</a>` : ""}
    </div>
    ${timelineHtml ? `
    <div class="section">
      <h3>Thời Gian Trọng Đại</h3>
      <div class="timeline">${timelineHtml}</div>
    </div>
    ` : ""}
    ${bankInfoHtml}
    <div class="thank-you">
      <p>${opts.thankYouNote}</p>
    </div>
    ${qrHtml}
    <div class="cta-section">
      <p>Xác nhận tham dự & xem chi tiết</p>
      <a href="${opts.inviteUrl}">Truy Cập Thiệp Cưới</a>
    </div>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thư Mời Cưới - ${coupleNames}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: ${colors.background || "#faf7f4"};
      color: ${colors.text || "#333333"};
      line-height: 1.6;
      padding: 20px;
    }
    .invite-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${colors.primary || "#d4a574"}, ${colors.secondary || "#c9956c"});
      color: white;
      padding: 50px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 300;
      letter-spacing: 2px;
    }
    .header .couple-names {
      font-size: 42px;
      font-weight: 700;
      margin: 20px 0;
    }
    .greeting {
      text-align: center;
      padding: 30px;
      font-size: 20px;
      color: ${colors.text || "#333"};
      background: ${colors.background || "#faf7f4"};
    }
    .greeting strong {
      color: ${colors.primary || "#d4a574"};
    }
    .section {
      padding: 40px 30px;
      border-bottom: 1px solid #eee;
    }
    .section:last-child { border-bottom: none; }
    .section h3 {
      text-align: center;
      color: ${colors.primary || "#d4a574"};
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
    }
    .event-details { text-align: center; }
    .event-details .date { font-size: 28px; font-weight: 600; margin-bottom: 10px; }
    .event-details .time { font-size: 20px; color: #666; margin-bottom: 20px; }
    .event-details .venue { font-size: 24px; font-weight: 600; color: ${colors.primary}; }
    .event-details .address { color: #666; margin-top: 5px; }
    .map-link {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 30px;
      background: ${colors.primary || "#d4a574"};
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-size: 14px;
    }
    .timeline { max-width: 400px; margin: 0 auto; }
    .timeline-item { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px dashed #eee; }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-time { font-weight: 600; color: ${colors.primary}; min-width: 60px; }
    .timeline-content strong { display: block; }
    .bank-info { text-align: center; }
    .bank-entry { padding: 15px; background: ${colors.background}; border-radius: 8px; margin: 10px 0; }
    .thank-you { text-align: center; padding: 50px 30px; background: ${colors.background}; font-style: italic; color: #666; }
    .cta-section { text-align: center; padding: 40px; background: ${colors.primary}; color: white; }
    .cta-section a {
      display: inline-block;
      padding: 15px 40px;
      background: white;
      color: ${colors.primary};
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 20px;
    }
    .footer { text-align: center; padding: 30px; font-size: 12px; color: #999; }
    .qr-section { text-align: center; padding: 30px; }
    .qr-code { width: 150px; height: 150px; border-radius: 8px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .gallery-grid img { width: 100%; border-radius: 8px; }
    @media (max-width: 480px) {
      .header h1 { font-size: 24px; }
      .header .couple-names { font-size: 32px; }
      .event-details .date { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="invite-container">
    <div class="header">
      <h1>Thư Mời Cưới</h1>
      <div class="couple-names">${coupleNames}</div>
      <p>Chúng tôi trân trọng kính mời bạn đến dự tiệc cưới</p>
    </div>

    <div class="greeting">
      <strong>${personalizedGreeting}</strong><br>
      Cùng với gia đình chúng tôi, hân hạnh được đón tiếp!
    </div>

    ${sectionsHtml || defaultSectionsHtml}

    <div class="footer">
      <p>Thiệp cưới này được gửi đến bạn bởi ${groomName} & ${brideName}</p>
      <p style="margin-top: 10px; font-size: 10px; color: #ccc;">Generated by Wedding Invitation System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
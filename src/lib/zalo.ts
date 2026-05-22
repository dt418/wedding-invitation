import { env } from "@/env";

export type ZaloChannel = "mini_app" | "bot" | "hybrid";

export interface ZaloSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ZaloDeepLinkPayload {
  inviteCode: string;
  eventId: string;
  timestamp: number;
}

export function generateZaloMiniAppUrl(inviteUrl: string, appId?: string): string {
  const zaloAppId = appId || env.ZALO_MINI_APP_ID || "";
  const payload = {
    action: "open_mini_app",
    url: inviteUrl,
    timestamp: Date.now(),
  };
  const encodedData = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `zalosdk://zalo.app/${zaloAppId}?action=open&data=${encodedData}`;
}

export function generateZaloBotDeepLink(
  inviteCode: string,
  message: string
): string {
  const oaId = env.ZALO_OA_ID || "";
  const params = new URLSearchParams({
    content: message,
    link: `${env.ZALO_DEEP_LINK_BASE || ""}/${inviteCode}`,
  });
  return `https://oa.zalo.me/${oaId}?${params.toString()}`;
}

export function generateZaloShareUrl(inviteCode: string): string {
  return `${env.ZALO_DEEP_LINK_BASE || "https://invite.example.com"}/${inviteCode}`;
}

export function isZaloSdkAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { zalosdk?: unknown }).zalosdk;
}

export async function launchZaloMiniApp(inviteUrl: string): Promise<boolean> {
  if (!isZaloSdkAvailable()) {
    console.warn("Zalo SDK not available, falling back to deep link");
    window.open(inviteUrl, "_blank");
    return false;
  }

  const miniAppUrl = generateZaloMiniAppUrl(inviteUrl);
  window.location.href = miniAppUrl;
  return true;
}

export function buildZaloInviteMessage(params: {
  groomName: string;
  brideName: string;
  eventDate: string;
  venueName: string;
  inviteUrl: string;
}): string {
  const { groomName, brideName, eventDate, venueName, inviteUrl } = params;
  return `Lời mời cưới

Kính mời bạn đến dự tiệc cưới của

${groomName} & ${brideName}

${eventDate}
${venueName}

Xem chi tiết: ${inviteUrl}`;
}
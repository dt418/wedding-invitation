import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8);

export function generateInviteCode(): string {
  return nanoid();
}

export function generateInviteUrl(eventSlug: string, inviteCode: string): string {
  return `/invite/${inviteCode}`;
}
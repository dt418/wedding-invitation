import { notFound } from "next/navigation";
import InviteRenderer from "@/components/invite-renderer";
import RsvpForm from "@/components/rsvp-form";
import LanguageSelector from "@/components/ui/language-selector";
import { db } from "@/db";
import { invites, guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Gender, Relation } from "@/lib/personalization";
import { getLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  const locale = await getLocale();

  // Fetch invite with guest info for personalization
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.inviteCode, code))
    .limit(1);

  if (!invite) notFound();

  // Fetch guest for personalization
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, invite.guestId))
    .limit(1);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/invites/${code}`);

  if (!res.ok) notFound();

  let data;
  try {
    data = await res.json();
  } catch {
    notFound();
  }

  const { sections, variant } = data;

  const visibleSections = sections.filter(
    (s: { visibility: string }) => s.visibility !== "hidden"
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: variant?.colorTokens?.background }}>
      {/* Language Selector - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector currentLocale={locale} />
      </div>

      <div className="max-w-5xl mx-auto pt-16">
        <InviteRenderer
          sections={visibleSections}
          colorTokens={variant?.colorTokens || {}}
          locale={locale}
          // Pass guest data for personalization
          guestName={guest?.name}
          guestGender={guest?.gender as Gender | null}
          guestRelation={guest?.relation as Relation | null}
        />

        <div className="mt-8">
          <RsvpForm
            inviteCode={code}
            guestName={data.invite?.guestName || guest?.name}
            colorTokens={variant?.colorTokens || {}}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}

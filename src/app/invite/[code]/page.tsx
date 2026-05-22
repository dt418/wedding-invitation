import { notFound } from "next/navigation";
import InviteRenderer from "@/components/invite-renderer";
import RsvpForm from "@/components/rsvp-form";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.inviteCode, code))
    .limit(1);

  if (!invite) notFound();

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
      <div className="max-w-5xl mx-auto">
        <InviteRenderer
          sections={visibleSections}
          colorTokens={variant?.colorTokens || {}}
        />

        <div className="mt-8">
          <RsvpForm
            inviteCode={code}
            guestName={data.invite?.guestName}
            colorTokens={variant?.colorTokens || {}}
          />
        </div>
      </div>
    </div>
  );
}

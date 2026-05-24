import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TemplatesGalleryClient } from "@/components/templates/templates-gallery-client";
import { getLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const locale = await getLocale();
  const all = await db
    .select()
    .from(templates)
    .where(eq(templates.isActive, true));

  return <TemplatesGalleryClient templates={all} locale={locale} />;
}

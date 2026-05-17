import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TemplatesGalleryClient } from "@/components/templates/templates-gallery-client";

export default async function TemplatesPage() {
  const all = await db.query.templates.findMany({
    where: eq(templates.isActive, true),
  });

  return <TemplatesGalleryClient templates={all} />;
}
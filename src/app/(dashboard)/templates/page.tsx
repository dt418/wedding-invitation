import { db } from "@/db";
import { templates, templateVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TemplatesGalleryClient } from "@/components/templates/templates-gallery-client";

const categoryLabels: Record<string, string> = {
  truyen_thong: "Traditional",
  thien_nhien: "Nature",
  hien_dai: "Modern",
  lang_man: "Romantic",
  co_phuc: "Ao Dai",
  sang_trong: "Luxury",
  toi_gian: "Minimalist",
  typography: "Typography",
  de_thuong: "Cute",
};

export default async function TemplatesPage() {
  const all = await db.query.templates.findMany({
    where: eq(templates.isActive, true),
  });

  const withVariants = await Promise.all(
    all.map(async (t) => {
      const variants = await db.query.templateVariants.findMany({
        where: eq(templateVariants.templateId, t.id),
      });
      return { ...t, variants };
    })
  );

  const grouped = withVariants.reduce(
    (acc, tmpl) => {
      const cat = tmpl.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tmpl);
      return acc;
    },
    {} as Record<string, typeof withVariants>
  );

  return (
    <TemplatesGalleryClient
      grouped={grouped}
      categoryLabels={categoryLabels}
    />
  );
}
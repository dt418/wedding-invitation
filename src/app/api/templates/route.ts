import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates, templateVariants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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

  return NextResponse.json(withVariants);
}
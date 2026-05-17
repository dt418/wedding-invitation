import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates, templateVariants } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const all = await db.query.templates.findMany({
    where: eq(templates.isActive, true),
  });

  if (all.length === 0) return NextResponse.json([]);

  const templateIds = all.map((t) => t.id);
  const allVariants = await db.query.templateVariants.findMany({
    where: inArray(templateVariants.templateId, templateIds),
  });

  const variantsByTemplate = new Map<string, typeof allVariants>();
  for (const variant of allVariants) {
    const list = variantsByTemplate.get(variant.templateId) ?? [];
    list.push(variant);
    variantsByTemplate.set(variant.templateId, list);
  }

  const withVariants = all.map((t) => ({
    ...t,
    variants: variantsByTemplate.get(t.id) ?? [],
  }));

  return NextResponse.json(withVariants);
}
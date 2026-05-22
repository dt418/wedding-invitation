import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function TemplateDemoPage({ params }: PageProps) {
  const { code } = await params;

  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.slug, code), eq(templates.isActive, true)))
    .limit(1);

  if (!template) notFound();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-rose-50 border-b border-rose-100 py-3 px-4 text-center">
        <span className="text-sm font-medium text-rose-700">
          Preview Mode
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {template.name}
          </h1>
          {template.description && (
            <p className="text-zinc-500">{template.description}</p>
          )}
        </div>

        {template.thumbnailUrl && (
          <div className="mb-8">
            <div className="rounded-lg overflow-hidden border border-zinc-200 bg-white">
              <div className="aspect-video relative">
<Image
                src={template.thumbnailUrl}
                alt={template.name}
                fill
                className="object-cover"
              />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-zinc-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-700 mb-2">
            Template Preview
          </h2>
          <p className="text-zinc-500 text-sm">
            This is a preview of the &quot;{template.name}&quot; template.
            Create an event to see full content customization.
          </p>
        </div>
      </div>
    </div>
  );
}
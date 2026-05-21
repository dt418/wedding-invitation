import { db } from "../src/db/index";
import { events } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function updateEventThumbnails() {
  const allEvents = await db.query.events.findMany({
    columns: { id: true, templateId: true },
  });

  if (allEvents.length === 0) {
    console.log("No events to update.");
    return;
  }

  // Get template slug from templateId (via seed data mapping)
  const templateSlugMap = {
    // Map templateId to slug - we'll query the templates table
  };

  const templates = await db.query.templates.findMany({
    columns: { id: true, slug: true },
  });

  for (const tpl of templates) {
    const count = await db.update(events)
      .set({ thumbnailUrl: `/images/template-previews/listing/${tpl.slug}.svg` })
      .where(eq(events.templateId, tpl.id))
      .returning({ id: events.id });

    if (count.length > 0) {
      console.log(`Updated ${count.length} events for template: ${tpl.slug}`);
    }
  }
}

updateEventThumbnails()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

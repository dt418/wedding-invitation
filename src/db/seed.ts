import { db } from "./index";
import { templates, templateVariants, sections, users } from "./schema";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@wedding.local";
const DEMO_PASSWORD = "Aa@123456#";

const seedTemplates = [
  {
    name: "Song Long",
    slug: "song-long",
    category: "truyen_thong" as const,
    description: "Traditional dragon-phoenix wedding invitation",
    tags: ["traditional", "dragon", "red", "gold"],
    metadata: {
      heroImage: "/templates/song-long/hero.jpg",
      style: "traditional-vietnamese",
      fontPair: ["Playfair Display", "Noto Serif"],
    },
  },
  {
    name: "Vườn Xuân",
    slug: "vuon-xuan",
    category: "thien_nhien" as const,
    description: "Floral garden wedding invitation",
    tags: ["nature", "floral", "spring", "green"],
    metadata: {
      heroImage: "/templates/vuon-xuan/hero.jpg",
      style: "floral-nature",
      fontPair: ["Cormorant Garamond", "Lato"],
    },
  },
  {
    name: "Minimal Touch",
    slug: "minimal-touch",
    category: "toi_gian" as const,
    description: "Clean minimal wedding invitation",
    tags: ["minimal", "clean", "modern", "white"],
    metadata: {
      heroImage: "/templates/minimal-touch/hero.jpg",
      style: "minimal-modern",
      fontPair: ["Inter", "Inter"],
    },
  },
];

export async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [demoUser] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      passwordHash,
      name: "Demo User",
      role: "user",
    })
    .onConflictDoNothing()
    .returning();

  if (demoUser) {
    console.log(`Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  }

  console.log("Seeding templates...");

  for (const tmpl of seedTemplates) {
    const [inserted] = await db.insert(templates).values(tmpl).returning();

    await db.insert(templateVariants).values({
      templateId: inserted.id,
      variantName: "Classic",
      colorTokens: {
        primary: "#C41E3A",
        secondary: "#FFD700",
        accent: "#8B0000",
        background: "#FFF8F0",
        text: "#1A1A1A",
      },
      isDefault: true,
    });

    const defaultSections = [
      { sectionType: "hero", order: 0, isRequired: true },
      { sectionType: "couple-names", order: 1, isRequired: true },
      { sectionType: "event-info", order: 2, isRequired: true },
      { sectionType: "venue", order: 3, isRequired: true },
      { sectionType: "timeline", order: 4, isRequired: false },
      { sectionType: "gallery", order: 5, isRequired: false },
      { sectionType: "rsvp", order: 6, isRequired: true },
    ] as const;

    for (const sec of defaultSections) {
      await db.insert(sections).values({
        templateId: inserted.id,
        sectionType: sec.sectionType,
        order: sec.order,
        isRequired: sec.isRequired,
        isEditable: true,
        contentSchema: {
          type: "object",
          properties: {},
        },
        defaultContent: {},
        animations: { entrance: "fade", duration: 600 },
      });
    }

    console.log(`Seeded: ${tmpl.name}`);
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
